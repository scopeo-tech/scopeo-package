# Project Monitoring Library

![npm](https://img.shields.io/npm/v/scopeo)
![License](https://img.shields.io/npm/l/scopeo)

Efficiently monitor security, errors, performance, and key metrics in your projects. Scopeo provides real-time insights with an integrated agent, helping you catch issues early and optimize performance.


## 📦 Installation

```bash
npm install scopeo
```

Or with Yarn:

```bash
yarn add scopeo
```

## 🚀 Usage

Import the library and initialize it in your project:

```javascript
import {configManager} from "scopeo";

export const setupScopeoConfig = ()=>{
try {
    configManager.setConfig({
        apiKey: process.env.API_KEY,
        passKey: process.env.PASS_KEY,
        environment: process.env.ENVIRONMENT // Set the environment (e.g., 'development' or 'production')
        
        // 'development' enables detailed system monitoring data
    });
} catch (error) {
    console.log(error,"from scopeo package");
}
}
```

### Configuration

```javascript
import { setupScopeoConfig } from 'your-file';

// Call this in your entry file (e.g., index.js)
setupScopeoConfig()

```

### Monitoring Events

```javascript
import initializeScopeo from 'scopeo'

// Call this in your entry file (e.g., index.js), right after the config call
initializeScopeo(app);
```


### Logging Errors

```javascript
import { scopeoErrorHandler, } from 'scopeo'

// Call this at the end of your entry file (e.g., index.js) to handle errors
scopeoErrorHandler(app);

// Make sure this is after all your routes/middleware
```


📊 Metrics Agent

The library comes with a built-in agent that runs alongside your application to collect, process, and store metrics. Install the package, and the agent takes care of the rest.


## 📘 API Reference

For detailed API documentation, check out our [API Reference](#).

## 🛡️ Security

We take security seriously. Learn more about how we handle data and secure your metrics in our [Security Policy](#).

## 🛠️ Contributing

Contributions are welcome! Feel free to fork the repo, create a new branch, and submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

