# Project Structure

## Directory Organization

```
birthday-notification-system/
├── src/                    # Application source code
│   ├── index.js           # Main entry point
│   ├── models/            # Data models
│   │   ├── Associate.js   # Associate data model
│   │   └── Configuration.js # Configuration model
│   ├── services/          # Business logic services
│   │   ├── BirthdayCheckService.js  # Main orchestrator
│   │   ├── Scheduler.js             # Cron scheduling
│   │   ├── ExcelParser.js           # Excel file parsing
│   │   ├── DateMatcher.js           # Birthday matching logic
│   │   └── SMSService.js            # SMS API integration
│   └── utils/             # Utility modules
│       └── Logger.js      # Logging utility
├── tests/                 # Test files
├── examples/              # Usage examples
├── data/                  # Excel files location
├── logs/                  # Application logs
└── node_modules/          # Dependencies
```

## Architecture Pattern

**Service-Oriented Architecture** with clear separation of concerns:

1. **Entry Point** (`src/index.js`)
   - Loads environment configuration
   - Initializes logger and scheduler
   - Handles graceful shutdown

2. **Models** (`src/models/`)
   - Data structures and validation
   - Configuration management

3. **Services** (`src/services/`)
   - Business logic components
   - Each service has a single responsibility
   - Services are composable and testable

4. **Utils** (`src/utils/`)
   - Shared utilities (logging, etc.)

## Service Dependencies

```
Scheduler
  └── BirthdayCheckService (orchestrator)
      ├── Configuration
      ├── ExcelParser
      ├── DateMatcher
      └── SMSService
```

## Code Conventions

- ES Modules (import/export)
- Class-based services
- Constructor dependency injection
- Optional logger injection for all services
- JSDoc comments for all public methods
- Async/await for asynchronous operations
- Comprehensive error handling with try/catch
- Graceful degradation (log errors, continue operation)

## File Naming

- Services: PascalCase (e.g., `BirthdayCheckService.js`)
- Tests: Match source file with `.test.js` suffix
- Configuration files: lowercase with hyphens (e.g., `vitest.config.js`)

## Key Design Patterns

- **Dependency Injection**: Services receive dependencies via constructor
- **Factory Pattern**: Services create instances of dependencies
- **Observer Pattern**: Cron scheduler triggers daily checks
- **Strategy Pattern**: Configurable SMS providers
