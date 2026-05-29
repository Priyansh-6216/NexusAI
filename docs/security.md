# Security and Compliance Guide

Security best practices and compliance considerations for NexusAI.

---

## Authentication & Authorization

### JWT Token Security

**Implementation:**
```
HS256 (HMAC SHA-256) with 32+ character secret
Token Structure: header.payload.signature
```

**Best Practices:**

1. **Secret Management**
   - Store JWT_SECRET in secure vault (AWS Secrets Manager, HashiCorp Vault)
   - Never commit secrets to git
   - Rotate secrets every 90 days
   - Use different secrets for dev/staging/production

2. **Token Lifetime**
   ```
   Access Token:  3600 seconds (1 hour)
   Refresh Token: 604800 seconds (7 days)
   ```
   - Short-lived access tokens minimize breach impact
   - Refresh tokens stored securely in httpOnly cookies
   - Implement token revocation on logout

3. **Token Transmission**
   - Always use HTTPS/TLS in production
   - Include in Authorization header: `Bearer {token}`
   - Never log token values
   - Use httpOnly cookies for refresh tokens (prevents XSS access)

### RBAC (Role-Based Access Control)

**Default Roles:**

| Role | Intended User | Key Permissions |
| --- | --- | --- |
| `admin` | Platform administrators | All operations |
| `developer` | Engineers | Read repos, write reviews, read incidents |
| `reviewer` | Code reviewers | Read repos, write reviews |
| `observer` | Stakeholders | Read-only access |

**Permission Model:**
```
User → Role → Permissions
      (many-to-many)
```

**Enforcement Pattern:**
```
1. Authenticate (validate JWT)
2. Extract roles from JWT claims
3. Lookup role permissions
4. Check required permission for action
5. Allow/deny based on permission match
```

**Implementation Example:**
```java
@PreAuthorize("hasPermission('write:reviews')")
@PostMapping("/reviews/analyze")
public ResponseEntity analyzeCode(...) { }
```

---

## Network Security

### HTTPS/TLS Configuration

**Production Requirements:**
- TLS 1.2 minimum (TLS 1.3 preferred)
- Valid certificate from trusted CA
- Certificate auto-renewal (via Let's Encrypt with cert-manager)
- HSTS header enabled

**Kubernetes Configuration:**
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: nexusai-tls
spec:
  secretName: nexusai-tls
  issuerRef:
    name: letsencrypt-prod
  dnsNames:
    - api.nexusai.com
```

**Application Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

### API Gateway Security

**Features:**
- Request validation and sanitization
- Rate limiting per user/IP
- Circuit breaker on backend failures
- Request timeout (30s default)
- CORS restrictions

**CORS Configuration:**
```
Allowed Origins: https://nexusai.com (production)
Allowed Methods: GET, POST, PUT, PATCH, DELETE
Allowed Headers: Content-Type, Authorization
Max Age: 3600 seconds
```

### Network Policies (Kubernetes)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nexusai-ingress
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
```

---

## Data Security

### Encryption at Rest

**PostgreSQL:**
- Enable LUKS encryption on storage volumes
- Transparent Data Encryption (TDE) if supported
- Encrypted backups (pgcrypto)

```sql
-- Encrypt sensitive columns
ALTER TABLE auth_schema.users
  ALTER COLUMN email TYPE bytea USING pgp_pub_encrypt(email::text, keys.pubkey)
  FROM keys
  WHERE keys.id = 1;
```

**Redis:**
- Enable AOF (Append-Only File) persistence
- Encrypted backups to object storage
- TLS connections between client-server

```conf
tls-port 6380
tls-cert-file /etc/redis/redis.crt
tls-key-file /etc/redis/redis.key
tls-ca-cert-file /etc/redis/ca.crt
```

### Encryption in Transit

- **All external APIs:** HTTPS/TLS 1.2+
- **Inter-service communication:** mTLS (mutual TLS) in Kubernetes
- **Database connections:** Use SSL mode

**Example - PostgreSQL SSL:**
```bash
JDBC_URL=jdbc:postgresql://postgres:5432/nexusai?ssl=true&sslmode=require
```

### Data Classification

| Level | Examples | Protection |
| --- | --- | --- |
| Public | Documentation | No special handling |
| Confidential | Source code | Access control |
| Restricted | Credentials, API keys | Encryption + vault |
| Secret | Passwords, tokens | Encrypted + MFA access |

---

## Secrets Management

### Development

Store secrets in `.env` (git-ignored):
```bash
echo ".env" >> .gitignore
```

Rotate local development secrets quarterly.

### Production

Use managed secrets service:

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name nexusai/jwt-secret \
  --secret-string $(openssl rand -hex 32)

# Rotate every 90 days
aws secretsmanager rotate-secret --secret-id nexusai/jwt-secret
```

**Kubernetes Secrets:**
```bash
kubectl create secret generic nexusai-secrets \
  --from-literal=jwt-secret=<value> \
  --from-literal=db-password=<value>

# Mounted as files in pods (never as env vars)
```

**Never:**
- Commit secrets to git
- Log secret values
- Pass secrets as CLI arguments
- Store in Docker images
- Email secrets

---

## Input Validation & Sanitization

### SQL Injection Prevention

Always use parameterized queries:

```java
// ✗ Vulnerable
String query = "SELECT * FROM users WHERE email = '" + email + "'";
ResultSet rs = stmt.executeQuery(query);

// ✓ Safe - parameterized
PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
pstmt.setString(1, email);
ResultSet rs = pstmt.executeQuery();
```

### XSS Prevention

Sanitize user input in frontend:

```javascript
// ✗ Vulnerable - could execute script
element.innerHTML = userInput;

// ✓ Safe - text content only
element.textContent = userInput;

// Or use sanitization library
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Input Constraints

Validate all inputs:

```
Email:        RFC 5322 format, max 255 chars
Password:     Min 12 chars, uppercase, number, special char
PR Number:    Integer, positive
Repository:   alphanumeric, hyphen, underscore only
API Response: < 10MB, timeout 30s
```

---

## Vulnerability Management

### Dependency Scanning

**Java:**
```bash
# Maven
mvn dependency-check:check

# Or Snyk
snyk test
```

**Python:**
```bash
# Safety
safety check requirements.txt

# Or Snyk
snyk test
```

**Frontend:**
```bash
# npm audit
npm audit

# Or Snyk
snyk test
```

**Process:**
1. Run scans in CI/CD on every commit
2. Block merge if critical vulnerabilities found
3. Remediate vulnerabilities within 7 days
4. Document exceptions for unfixable issues

### Security Audit Checklist

- [ ] No hardcoded secrets in code
- [ ] All external inputs validated
- [ ] Database queries parameterized
- [ ] Authentication enforced on protected endpoints
- [ ] Authorization checked for sensitive operations
- [ ] Errors don't leak sensitive info
- [ ] Logging doesn't capture secrets
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] TLS/SSL enforced in production

---

## Monitoring & Logging

### Audit Logging

Track sensitive operations:

```sql
CREATE TABLE audit_schema.audit_log (
  log_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES auth_schema.users(user_id),
  action VARCHAR(100),           -- login, logout, permission_change, data_access
  resource_type VARCHAR(100),    -- users, incidents, repositories
  resource_id VARCHAR(255),
  status VARCHAR(20),            -- success, failure
  ip_address VARCHAR(45),        -- IPv4 or IPv6
  user_agent TEXT,
  details JSONB,                 -- Additional context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Immutable: disable deletes
ALTER TABLE audit_schema.audit_log DISABLE TRIGGER ALL;
```

**Events to Log:**
- User authentication (success/failure)
- Permission changes
- Data access (high sensitivity)
- Configuration changes
- API key generation/revocation
- Failed authorization attempts

### Log Security

**Storage:**
- Centralized logging (ELK, Splunk)
- Encrypt logs at rest and in transit
- 90-day retention minimum, 1-year maximum
- Immutable audit logs (append-only)

**Protection:**
- Logs contain no passwords or tokens
- Redact sensitive data (email patterns, partial API keys)
- Restrict access (read-only for developers)
- Alert on suspicious patterns

```
Example Log:
{
  "timestamp": "2026-05-29T15:15:39Z",
  "service": "auth-service",
  "user_id": 42,
  "action": "login",
  "status": "success",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
  // No passwords, tokens, or full emails
}
```

### Security Alerts

Alert on:
- Failed authentication attempts (5+ in 5 min)
- Multiple failed authorizations
- Unusual data access patterns
- Configuration changes
- Deployment of unsigned containers
- Certificate expiration (7 days before)

---

## Secure Deployment

### Container Security

**Image Scanning:**
```bash
# Scan before push
docker scan nexusai-api-gateway:1.0.0

# Or use Trivy
trivy image nexusai-api-gateway:1.0.0
```

**Best Practices:**
- Use minimal base images (alpine, distroless)
- Don't run as root
- Scan images regularly
- Sign images with Docker Content Trust

```dockerfile
FROM eclipse-temurin:17-jre-alpine
RUN adduser -S nexusai
USER nexusai
COPY --chown=nexusai:nexusai app.jar /app/
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Kubernetes Security

**Pod Security Policy:**
```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
```

**Network Segmentation:**
- API Gateway in public namespace
- Services in private namespace
- Database in isolated namespace
- Restrict inter-namespace communication

---

## Compliance

### GDPR Compliance

**Requirements:**
- User consent for data processing
- Right to access personal data
- Right to be forgotten (data deletion)
- Data export functionality
- Privacy policy and terms

**Implementation:**
```sql
-- Support user data deletion
DELETE FROM auth_schema.user_roles WHERE user_id = ?;
DELETE FROM auth_schema.sessions WHERE user_id = ?;
DELETE FROM auth_schema.users WHERE user_id = ?;
```

### SOC 2 Compliance

**Checklist:**
- [ ] Access controls (authentication/authorization)
- [ ] Audit logging (all changes tracked)
- [ ] Incident response plan
- [ ] Disaster recovery procedures
- [ ] Change management process
- [ ] Regular security assessments
- [ ] Vulnerability management
- [ ] Data backup and recovery testing

### Security Training

- Annual security awareness training
- Code review focusing on security
- OWASP Top 10 knowledge
- Incident response drills

---

## Incident Response

### Breach Response Plan

**Timeline:**
1. **Detection** (continuous monitoring)
2. **Analysis** (0-1 hour)
3. **Containment** (0-2 hours)
4. **Eradication** (varies)
5. **Recovery** (varies)
6. **Lessons Learned** (post-incident)

**Key Actions:**
- Immediately isolate affected systems
- Revoke compromised credentials
- Notify affected users (within 72 hours)
- Document timeline and impact
- Contact legal/compliance teams

### Post-Incident

- Root cause analysis
- Security patches
- Policy updates
- Team training

---

## Security Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **Security Headers**: https://securityheaders.com

