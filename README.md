# 🔒 SecretVote - Confidential Voting dApp

> Built with FHEVM for Zama Developer Program

## 🌟 Overview

SecretVote is a privacy-preserving voting platform where votes remain encrypted on-chain using Fully Homomorphic Encryption (FHE). Users can create polls and vote without revealing their choices until the poll ends.

## ✨ Features

- ✅ **Encrypted Voting** - Votes are encrypted using TFHE and remain private on-chain
- ✅ **Poll Creation** - Create custom polls with 2-10 options
- ✅ **Time-Bound Polls** - Set duration from 1 hour to 30 days
- ✅ **Decentralized** - No central authority can see votes before reveal
- ✅ **User-Friendly UI** - Modern, intuitive interface

## 🔐 How FHE Ensures Privacy

This dApp uses FHEVM (Fully Homomorphic Encryption Virtual Machine) to:

1. **Encrypt votes client-side** before sending to blockchain
2. **Perform computations on encrypted data** without decryption
3. **Aggregate votes** while maintaining privacy
4. **Decrypt results** only after poll ends using Zama's Gateway

Traditional voting systems either:
- Store votes in plaintext (no privacy)
- Use commit-reveal schemes (vulnerable to timing attacks)

FHE solves this by allowing vote counting on encrypted data.

## 🏗️ Architecture
```
User → Encrypt Vote → Smart Contract → FHE Computation → Encrypted Tally
                                                              ↓
                                                    (After poll ends)
                                                              ↓
                                                      Gateway Decryption
                                                              ↓
                                                         Final Results
```

## 📝 Smart Contract

**Network:** Zama Sepolia Testnet  
**Contract Address:** `0x...` (update after deployment)

Key Functions:
- `createPoll()` - Create a new voting poll
- `vote()` - Cast an encrypted vote
- `finalizePoll()` - Reveal results after poll ends

## 🚀 Live Demo

**Frontend:** [https://confidential-voting-dapp.vercel.app/](#) (update with your deployment)

## 🎥 Demo Video

[Link to demo video] (optional but recommended)

## 💻 Installation & Setup

### Prerequisites
```bash
node >= 18.0.0
npm or yarn
MetaMask or compatible wallet
```

### Install Dependencies
```bash
npm install
```

### Deploy Smart Contract
```bash
# Install Hardhat
npm install --save-dev hardhat

# Deploy to Zama Sepolia
npx hardhat run scripts/deploy.js --network zamaSepolia
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing
```bash
npm test
```

Test Coverage:
- Poll creation validation
- Encrypted vote casting
- Vote aggregation
- Access control
- Time-based restrictions

## 🛠️ Technologies Used

- **Smart Contracts:** Solidity, FHEVM, TFHE
- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Blockchain:** Zama Protocol (Sepolia Testnet)
- **Encryption:** Fully Homomorphic Encryption

## 📊 Use Cases

- 🏛️ DAO Governance voting
- 🗳️ Community polls
- 📋 Anonymous surveys
- 💼 Corporate decision-making
- 🎓 Academic elections

## 🎯 Business Potential

SecretVote addresses a critical need in Web3 governance:
- Most DAOs lack true vote privacy
- Traditional voting reveals preferences too early
- FHE enables genuine secret ballots on-chain

**Market Opportunity:**
- 10,000+ active DAOs need voting infrastructure
- Privacy-preserving governance is growing demand
- Can integrate with existing DAO frameworks (Snapshot, Aragon)

## 📄 License

MIT

## 👨‍💻 Built By

[Scott] - For Zama Developer Program (Builder Track)

## 🔗 Links

- [Zama Documentation](https://docs.zama.ai)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Guild.xyz Submission](https://guild.xyz/zama/developer-program)

---

**Note:** This is a demo project built for the Zama Developer Program. For production use, additional security audits and testing are required.
