# Welcome to NestJS with Prisma 👋

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
[![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-yellow.svg)](#)

> This project is built using NestJS, a progressive Node.js framework, with Prisma as the ORM. It leverages the power of
> SWC for faster compilation, and includes a global interceptor for standardized response handling, an incoming request
> logger, and constants for custom messages and a separate Swagger documentation for admin and web users. This ensures
> that each user type only accesses the relevant APIs and documentation, enhancing security and user experience.

## Features

### SWC in Nest

-   Faster build times and quicker recompilation.
-   Optimized for both development and production environments.

### Global Response Interceptor

-   Standardizes API responses for consistency.
-   Handles success and error responses uniformly.

### Incoming Request Logger

-   Logs details of all incoming requests for better monitoring and debugging.
-   Integrates seamlessly with NestJS's logging mechanism.

### Constants for Custom Messages and Swagger API

-   Centralized custom messages for application-wide use.
-   Enhanced Swagger API documentation with clear, consistent descriptions.

### Custom Param Decorators

-   Enhanced custom decorators that provides the ability to define query params for Swagger directly from the
    decorators, eliminating the need to define each query param separately in controller functions.

### Dual Swagger Interfaces

-   Two distinct Swagger UI interfaces are provided - one for admin users and another for web users. Each interface only
    displays the APIs relevant to that user type.

### Role-Based Access Control

-   The documentation access is controlled based on user roles. Admin users have access to a comprehensive set of APIs,
    while web users have limited access tailored to their needs.

### Customizable Documentation

-   Both Swagger interfaces are fully customizable. You can easily modify the API descriptions and parameters to suit
    the needs of each user type.

## Installation

To get started with this project, clone the repository and install the dependencies:

```sh
git clone https://your-repository-url.git
cd nest-prisma-project
npm install
```

## Usage

```sh
npm run start
```

## Run tests

```sh
npm run test
```

## Swagger Documentation
Once the setup is complete and running, you can simply click on the link to access documentation 
- [Admin](http://localhost:5000/api/doc/admin/) and  [Web](http://localhost:5000/api/doc/web)


## Author
*👤 **Shubham Kashyap <shubhamkashyap3026@gmail.com.com>**
* Github: [@Shubham Kashyap](https://github.com/Shubham Kashyap)
* Linkdin: [@shubham kashyap](https://in.linkedin.com/in/shubham-kashyap-58a310175)

## Show your support

Give a ⭐️ if this project helped you!

