# Formulate - Dynamic Form Builder & Survey Collector

A full-stack MERN application for creating custom surveys and data collection forms without writing code.

![Formulate App Banner](https://via.placeholder.com/1200x300.png?text=Formulate:+Dynamic+Form+Builder)

## Features

- **Visual Form Designer:** Create forms with different field types including text, email, number, dropdown, checkbox, and rating
- **Conditional Logic:** Show/hide fields based on previous answers
- **Multi-page Forms:** Create forms with multiple pages and a progress bar
- **Response Collection:** Collect anonymous responses with validation
- **Results Dashboard:** View and analyze form responses with visualizations
- **Export & Automations:** Export data to CSV/XLSX and configure webhooks

## Technologies Used

### Frontend
- React
- Material-UI for modern UI components
- React Router for navigation
- React Beautiful DnD for drag-and-drop functionality
- Chart.js for data visualization
- React Hook Form for form validation

### Backend
- Node.js & Express.js for API development
- MongoDB with Mongoose for data storage
- JWT authentication for user management
- RESTful API architecture

## Project Structure

- `/client` - React frontend application
- `/server` - Node.js/Express backend API

## Installation and Setup

See the [INSTRUCTIONS.md](INSTRUCTIONS.md) file for detailed setup instructions.

Quick start:
1. Clone the repository
2. Install dependencies with `npm install` in both `/client` and `/server` directories
3. Set up MongoDB and configure environment variables
4. Run backend with `npm run dev` in `/server`
5. Run frontend with `npm start` in `/client`

## Key Application Modules

### User Management
- User registration and authentication
- JWT-based authentication
- Password hashing and security

### Form Builder
- Drag-and-drop field positioning
- Multiple field types with validation
- Conditional logic for dynamic forms
- Multi-page form creation

### Response Collection
- Anonymous form submissions
- Validation based on field types
- Prevention of duplicate submissions
- Email notification (optional)

### Analysis Dashboard
- Response summary statistics
- Visual data representation
- Export to CSV/Excel
- Individual response viewing

## Demo

[View Live Demo](https://your-demo-url-here.com)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 