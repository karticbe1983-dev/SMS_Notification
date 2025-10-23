# Product Overview

## Birthday Notification System

An automated system that monitors associate birthdays from Excel spreadsheets and sends daily SMS notifications when birthdays occur.

## Core Functionality

- Reads associate data (name, date of birth) from Excel files (.xlsx/.xls)
- Runs scheduled daily checks at a configurable time
- Identifies associates with birthdays matching the current date
- Sends SMS notifications via configurable SMS gateway providers
- Provides comprehensive logging with daily rotation

## Key Features

- Automated scheduling using cron expressions
- Support for multiple date formats (MM/DD/YYYY, DD/MM/YYYY)
- Graceful error handling and recovery
- Secure credential management via environment variables
- Configurable SMS providers (Twilio, Nexmo, MessageBird, etc.)

## Target Users

- HR departments managing employee birthdays
- Organizations needing automated birthday reminders
- Teams requiring SMS-based notification systems
