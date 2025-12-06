# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at MailMind. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us at: security@mailmind.dev (or daxmodi@gmail.com)
3. Include as much detail as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Assessment**: We will assess the vulnerability and its impact within 7 days
- **Resolution**: Critical vulnerabilities will be addressed within 30 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer anonymity)

### Scope

The following are in scope:
- MailMind web application
- API endpoints
- Authentication flows
- Data handling and storage

The following are out of scope:
- Third-party services (Google OAuth, Gmail API)
- Social engineering attacks
- Physical attacks

## Security Best Practices

When self-hosting MailMind:

1. **Environment Variables**: Never commit `.env` files. Use `.env.example` as a template
2. **HTTPS**: Always use HTTPS in production
3. **Secrets**: Rotate `NEXTAUTH_SECRET` regularly
4. **Updates**: Keep dependencies up to date
5. **Access**: Use strong Google account security (2FA)

## Acknowledgments

We thank the following individuals for responsibly disclosing vulnerabilities:

*No vulnerabilities have been reported yet.*
