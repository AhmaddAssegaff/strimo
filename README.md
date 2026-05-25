## Features
- Role-Based Access Control (RBAC)
Authentication using JWT access tokens.
Authorization based on user roles (Admin, Manager, Cashier).
Protected endpoints with role-specific permissions.

- Multi-Location Inventory Management
Manage products across multiple locations (Outlets and Warehouses).
Track stock availability per location.
Support stock transfers between warehouses and outlets.
Location-specific inventory visibility and management.

- Product Management
Create, update, delete, and view products.
Product categorization and pricing management.
Stock monitoring and adjustment.

- Transaction Management
Create sales transactions.
Record transaction details and purchased items.
Automatic stock deduction after successful transactions.

- Branch & Outlet Management
Manage branches and outlets independently.
Assign users to be head manager or cashier in specific branch or outlet.


## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

