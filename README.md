# 🔒 TextLock

**Time-locked encryption for your secrets. Write now, reveal later.**

A Progressive Web App (PWA) that enables users to create time-locked encrypted messages using client-side AES-256-GCM encryption. Messages remain cryptographically inaccessible until a specified unlock time, with automatic self-destruction after viewing.

## Features

- ⏰ **Time-Locked Encryption** - Set future unlock times for your encrypted messages
- 🔐 **Military-Grade Security** - AES-256-GCM encryption with PBKDF2 key derivation
- 🔥 **Self-Destructing Messages** - 20-minute viewing window before permanent deletion
- 🚫 **Zero Knowledge** - All encryption happens client-side in your browser
- 📱 **Progressive Web App** - Install as native app on any platform
- ⚡ **Offline-First** - Works completely offline after first visit
- 🎨 **Modern UI** - Clean, elegant interface with dark/light theme support

## Technology Stack

- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2, SHA-256)
- **Storage**: LocalStorage (client-side only)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA**: Service Workers, Web App Manifest
- **Hosting**: GitHub Pages / Static hosting

## Use Cases

- Future self messages and reminders
- Timed surprise messages for special occasions
- Digital time capsules
- Temporary secure note storage
- Goal tracking with motivational reveals

## Security

- No server-side storage or processing
- No user accounts or tracking
- Time-based key derivation prevents early decryption
- Open source and auditable
- HTTPS-only operation

## Quick Start

Visit the live app: https://shroomcoder.github.io/textlock/

Or run locally:
```bash
# Serve with any static server
python3 -m http.server 8080
# Open http://localhost:8080
```

## License

MIT License - See LICENSE file for details

---

**Note**: TextLock is a client-side security tool. While it uses strong encryption, the unlock time acts as part of the encryption key, making messages cryptographically unreadable until that time. However, since everything runs in the browser, determined users with technical knowledge could potentially access encrypted data stored in localStorage.
