import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Passed' | 'Failed' | 'Blocked' | 'Not Run';
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  assignee: string;
  productId: string;
  moduleId: string;
  createdDate: string;
  lastRun: string;
  estimatedTime: number;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  productId: string;
  moduleId: string;
  testCaseIds: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  createdDate: string;
  lastModified: string;
  owner: string;
}

interface TestState {
  testCases: TestCase[];
  testSuites: TestSuite[];
}

const initialState: TestState = {
  testCases: [
    // Authentication Test Cases (MOD001)
    {
      id: "TC001",
      title: "User can login with valid credentials",
      description: "Verify that a user can successfully log in with correct username and password",
      priority: "High",
      status: "Passed",
      steps: ["Navigate to login page", "Enter valid username", "Enter valid password", "Click login button"],
      expectedResult: "User should be logged in and redirected to dashboard",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-10",
      lastRun: "2024-01-15",
      estimatedTime: 5
    },
    {
      id: "TC002",
      title: "User cannot login with invalid password",
      description: "Verify that login fails with incorrect password",
      priority: "High",
      status: "Passed",
      steps: ["Navigate to login page", "Enter valid username", "Enter invalid password", "Click login button"],
      expectedResult: "Error message should be displayed",
      assignee: "David Lee",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-10",
      lastRun: "2024-01-15",
      estimatedTime: 3
    },
    {
      id: "TC003",
      title: "Password reset functionality",
      description: "Test password reset email and link functionality",
      priority: "Medium",
      status: "Passed",
      steps: ["Click forgot password", "Enter email", "Check email for reset link", "Click reset link", "Enter new password"],
      expectedResult: "Password should be reset successfully",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-11",
      lastRun: "2024-01-16",
      estimatedTime: 8
    },
    {
      id: "TC004",
      title: "Account lockout after failed attempts",
      description: "Verify account lockout mechanism after multiple failed login attempts",
      priority: "Critical",
      status: "Failed",
      steps: ["Attempt login with wrong password 5 times", "Verify account is locked", "Wait for lockout period", "Try to login with correct credentials"],
      expectedResult: "Account should be locked and then unlocked after timeout",
      assignee: "David Lee",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-12",
      lastRun: "2024-01-17",
      estimatedTime: 15
    },
    {
      id: "TC005",
      title: "Two-factor authentication setup",
      description: "Test 2FA setup and verification process",
      priority: "High",
      status: "Not Run",
      steps: ["Go to security settings", "Enable 2FA", "Scan QR code", "Enter verification code", "Confirm setup"],
      expectedResult: "2FA should be enabled and working",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-01-13",
      lastRun: "Never",
      estimatedTime: 12
    },

    // Shopping Cart Test Cases (MOD002)
    {
      id: "TC006",
      title: "Add item to cart",
      description: "Test adding items to shopping cart",
      priority: "High",
      status: "Passed",
      steps: ["Browse product catalog", "Select a product", "Choose quantity", "Click add to cart"],
      expectedResult: "Item should be added to cart with correct quantity",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-12",
      lastRun: "2024-01-14",
      estimatedTime: 5
    },
    {
      id: "TC007",
      title: "Remove item from cart",
      description: "Test removing items from shopping cart",
      priority: "Medium",
      status: "Passed",
      steps: ["Add items to cart", "Go to cart page", "Click remove on an item", "Confirm removal"],
      expectedResult: "Item should be removed and cart total updated",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-12",
      lastRun: "2024-01-14",
      estimatedTime: 4
    },
    {
      id: "TC008",
      title: "Update item quantity in cart",
      description: "Test updating item quantities in cart",
      priority: "Medium",
      status: "Passed",
      steps: ["Add items to cart", "Go to cart page", "Change quantity", "Update cart"],
      expectedResult: "Quantity and total should be updated correctly",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-12",
      lastRun: "2024-01-14",
      estimatedTime: 6
    },
    {
      id: "TC009",
      title: "Cart persistence across sessions",
      description: "Verify cart contents persist when user logs out and back in",
      priority: "Low",
      status: "Blocked",
      steps: ["Add items to cart", "Logout", "Login again", "Check cart contents"],
      expectedResult: "Cart should contain the same items",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-13",
      lastRun: "2024-01-15",
      estimatedTime: 8
    },
    {
      id: "TC010",
      title: "Checkout process",
      description: "Complete end-to-end checkout process",
      priority: "Critical",
      status: "Failed",
      steps: ["Add items to cart", "Proceed to checkout", "Enter shipping info", "Select payment method", "Complete order"],
      expectedResult: "Order should be placed successfully",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-01-13",
      lastRun: "2024-01-16",
      estimatedTime: 20
    },

    // Product Catalog Test Cases (MOD003)
    {
      id: "TC011",
      title: "Product search functionality",
      description: "Test product search with various keywords",
      priority: "High",
      status: "Passed",
      steps: ["Enter search term", "Click search", "Review results", "Test with different keywords"],
      expectedResult: "Relevant products should be displayed",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD003",
      createdDate: "2024-01-14",
      lastRun: "2024-01-18",
      estimatedTime: 10
    },
    {
      id: "TC012",
      title: "Product filtering by category",
      description: "Test product filtering functionality",
      priority: "Medium",
      status: "Passed",
      steps: ["Select category filter", "Apply filter", "Verify results", "Test multiple filters"],
      expectedResult: "Products should be filtered correctly",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD003",
      createdDate: "2024-01-14",
      lastRun: "2024-01-18",
      estimatedTime: 12
    },
    {
      id: "TC013",
      title: "Product sorting options",
      description: "Test product sorting by price, popularity, rating",
      priority: "Low",
      status: "Not Run",
      steps: ["Select sort option", "Verify order", "Test different sort criteria"],
      expectedResult: "Products should be sorted correctly",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD003",
      createdDate: "2024-01-15",
      lastRun: "Never",
      estimatedTime: 8
    },

    // Mobile UI Components Test Cases (MOD004)
    {
      id: "TC014",
      title: "Navigation menu functionality",
      description: "Test mobile navigation menu behavior",
      priority: "High",
      status: "Passed",
      steps: ["Open mobile app", "Tap menu icon", "Navigate through sections", "Test back button"],
      expectedResult: "Navigation should work smoothly",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD004",
      createdDate: "2024-01-16",
      lastRun: "2024-01-20",
      estimatedTime: 8
    },
    {
      id: "TC015",
      title: "Touch gestures and interactions",
      description: "Test various touch interactions on mobile",
      priority: "Medium",
      status: "Passed",
      steps: ["Test tap gestures", "Test swipe actions", "Test pinch to zoom", "Test long press"],
      expectedResult: "All gestures should work as expected",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD004",
      createdDate: "2024-01-16",
      lastRun: "2024-01-20",
      estimatedTime: 15
    },
    {
      id: "TC016",
      title: "Responsive design on different screen sizes",
      description: "Test app layout on various mobile screen sizes",
      priority: "Medium",
      status: "Failed",
      steps: ["Test on small screen", "Test on large screen", "Test landscape mode", "Test portrait mode"],
      expectedResult: "Layout should adapt to screen size",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD004",
      createdDate: "2024-01-17",
      lastRun: "2024-01-21",
      estimatedTime: 12
    },

    // Push Notifications Test Cases (MOD005)
    {
      id: "TC017",
      title: "Push notification delivery",
      description: "Test push notification delivery to mobile devices",
      priority: "High",
      status: "Not Run",
      steps: ["Send test notification", "Verify delivery", "Test on different devices", "Check notification content"],
      expectedResult: "Notifications should be delivered correctly",
      assignee: "Carol Brown",
      productId: "PROD002",
      moduleId: "MOD005",
      createdDate: "2024-01-18",
      lastRun: "Never",
      estimatedTime: 10
    },
    {
      id: "TC018",
      title: "Notification permission handling",
      description: "Test notification permission request and handling",
      priority: "Medium",
      status: "Not Run",
      steps: ["Request notification permission", "Handle user response", "Test permission states"],
      expectedResult: "Permission should be handled gracefully",
      assignee: "Mark Anderson",
      productId: "PROD002",
      moduleId: "MOD005",
      createdDate: "2024-01-18",
      lastRun: "Never",
      estimatedTime: 8
    },

    // Offline Sync Test Cases (MOD006)
    {
      id: "TC019",
      title: "Offline data synchronization",
      description: "Test data sync when device goes offline and online",
      priority: "Critical",
      status: "Blocked",
      steps: ["Make changes while online", "Go offline", "Make more changes", "Come back online", "Verify sync"],
      expectedResult: "All changes should sync correctly",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD006",
      createdDate: "2024-01-19",
      lastRun: "2024-01-22",
      estimatedTime: 25
    },
    {
      id: "TC020",
      title: "Conflict resolution during sync",
      description: "Test conflict resolution when same data is modified offline and online",
      priority: "High",
      status: "Not Run",
      steps: ["Modify data offline", "Modify same data online from another device", "Sync offline device", "Verify conflict resolution"],
      expectedResult: "Conflicts should be resolved appropriately",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD006",
      createdDate: "2024-01-19",
      lastRun: "Never",
      estimatedTime: 30
    },

    // API Gateway Test Cases (MOD007)
    {
      id: "TC021",
      title: "API endpoint authentication",
      description: "Test API authentication and authorization",
      priority: "Critical",
      status: "Passed",
      steps: ["Send request without auth", "Send with invalid token", "Send with valid token", "Test token expiry"],
      expectedResult: "Authentication should work correctly",
      assignee: "Mark Anderson",
      productId: "PROD003",
      moduleId: "MOD007",
      createdDate: "2024-01-20",
      lastRun: "2024-01-24",
      estimatedTime: 15
    },
    {
      id: "TC022",
      title: "API rate limiting",
      description: "Test API rate limiting functionality",
      priority: "Medium",
      status: "Passed",
      steps: ["Send requests rapidly", "Verify rate limit enforcement", "Test different rate limits", "Test rate limit reset"],
      expectedResult: "Rate limiting should work as configured",
      assignee: "Mark Anderson",
      productId: "PROD003",
      moduleId: "MOD007",
      createdDate: "2024-01-20",
      lastRun: "2024-01-24",
      estimatedTime: 20
    },
    {
      id: "TC023",
      title: "API response format validation",
      description: "Verify API responses follow correct format",
      priority: "High",
      status: "Failed",
      steps: ["Call various endpoints", "Validate response schema", "Check error responses", "Verify data types"],
      expectedResult: "All responses should follow API specification",
      assignee: "Mark Anderson",
      productId: "PROD003",
      moduleId: "MOD007",
      createdDate: "2024-01-21",
      lastRun: "2024-01-25",
      estimatedTime: 18
    },

    // User Service Test Cases (MOD008)
    {
      id: "TC024",
      title: "User registration API",
      description: "Test user registration through API",
      priority: "High",
      status: "Not Run",
      steps: ["Send registration request", "Verify user creation", "Test duplicate email", "Test invalid data"],
      expectedResult: "User registration should work correctly",
      assignee: "Carol Brown",
      productId: "PROD003",
      moduleId: "MOD008",
      createdDate: "2024-01-22",
      lastRun: "Never",
      estimatedTime: 12
    },
    {
      id: "TC025",
      title: "User profile update API",
      description: "Test user profile update functionality",
      priority: "Medium",
      status: "Not Run",
      steps: ["Update user profile", "Verify changes", "Test invalid updates", "Test partial updates"],
      expectedResult: "Profile updates should work correctly",
      assignee: "Carol Brown",
      productId: "PROD003",
      moduleId: "MOD008",
      createdDate: "2024-01-22",
      lastRun: "Never",
      estimatedTime: 10
    },

    // Order Service Test Cases (MOD009)
    {
      id: "TC026",
      title: "Order creation API",
      description: "Test order creation through API",
      priority: "Critical",
      status: "Passed",
      steps: ["Create order request", "Verify order creation", "Test invalid orders", "Check order status"],
      expectedResult: "Orders should be created correctly",
      assignee: "David Lee",
      productId: "PROD003",
      moduleId: "MOD009",
      createdDate: "2024-01-23",
      lastRun: "2024-01-26",
      estimatedTime: 15
    },
    {
      id: "TC027",
      title: "Order status tracking",
      description: "Test order status updates and tracking",
      priority: "High",
      status: "Passed",
      steps: ["Create order", "Update status", "Track order", "Verify status changes"],
      expectedResult: "Order status should be tracked correctly",
      assignee: "Mark Anderson",
      productId: "PROD003",
      moduleId: "MOD009",
      createdDate: "2024-01-23",
      lastRun: "2024-01-26",
      estimatedTime: 12
    },

    // Payment Processing Test Cases (MOD010)
    {
      id: "TC028",
      title: "Credit card payment processing",
      description: "Test credit card payment processing",
      priority: "Critical",
      status: "Passed",
      steps: ["Enter card details", "Process payment", "Verify transaction", "Check payment status"],
      expectedResult: "Credit card payments should process correctly",
      assignee: "Carol Brown",
      productId: "PROD004",
      moduleId: "MOD010",
      createdDate: "2024-01-24",
      lastRun: "2024-01-28",
      estimatedTime: 18
    },
    {
      id: "TC029",
      title: "PayPal payment integration",
      description: "Test PayPal payment integration",
      priority: "High",
      status: "Passed",
      steps: ["Select PayPal option", "Redirect to PayPal", "Complete payment", "Return to merchant"],
      expectedResult: "PayPal payments should work seamlessly",
      assignee: "David Lee",
      productId: "PROD004",
      moduleId: "MOD010",
      createdDate: "2024-01-24",
      lastRun: "2024-01-28",
      estimatedTime: 15
    },
    {
      id: "TC030",
      title: "Payment failure handling",
      description: "Test payment failure scenarios",
      priority: "High",
      status: "Passed",
      steps: ["Use invalid card", "Insufficient funds", "Expired card", "Verify error handling"],
      expectedResult: "Payment failures should be handled gracefully",
      assignee: "Carol Brown",
      productId: "PROD004",
      moduleId: "MOD010",
      createdDate: "2024-01-25",
      lastRun: "2024-01-29",
      estimatedTime: 20
    },

    // Fraud Detection Test Cases (MOD011)
    {
      id: "TC031",
      title: "Suspicious transaction detection",
      description: "Test fraud detection for suspicious transactions",
      priority: "Critical",
      status: "Passed",
      steps: ["Create suspicious transaction", "Verify fraud detection", "Check alert generation", "Test false positives"],
      expectedResult: "Fraud should be detected accurately",
      assignee: "David Lee",
      productId: "PROD004",
      moduleId: "MOD011",
      createdDate: "2024-01-26",
      lastRun: "2024-01-30",
      estimatedTime: 25
    },
    {
      id: "TC032",
      title: "Machine learning model accuracy",
      description: "Test fraud detection ML model accuracy",
      priority: "High",
      status: "Passed",
      steps: ["Run test dataset", "Measure accuracy", "Check false positive rate", "Verify model performance"],
      expectedResult: "Model should meet accuracy thresholds",
      assignee: "Mark Anderson",
      productId: "PROD004",
      moduleId: "MOD011",
      createdDate: "2024-01-26",
      lastRun: "2024-01-30",
      estimatedTime: 30
    },

    // Payment Analytics Test Cases (MOD012)
    {
      id: "TC033",
      title: "Transaction reporting",
      description: "Test transaction reporting functionality",
      priority: "Medium",
      status: "Passed",
      steps: ["Generate transaction report", "Verify data accuracy", "Test date filters", "Export report"],
      expectedResult: "Reports should be accurate and complete",
      assignee: "Mark Anderson",
      productId: "PROD004",
      moduleId: "MOD012",
      createdDate: "2024-01-27",
      lastRun: "2024-01-31",
      estimatedTime: 15
    },

    // Data Visualization Test Cases (MOD013)
    {
      id: "TC034",
      title: "Chart rendering performance",
      description: "Test chart rendering with large datasets",
      priority: "Medium",
      status: "Passed",
      steps: ["Load large dataset", "Render charts", "Measure load time", "Test interactive features"],
      expectedResult: "Charts should render within acceptable time",
      assignee: "Carol Brown",
      productId: "PROD005",
      moduleId: "MOD013",
      createdDate: "2024-01-28",
      lastRun: "2024-02-01",
      estimatedTime: 20
    },
    {
      id: "TC035",
      title: "Dashboard responsiveness",
      description: "Test dashboard responsiveness on different devices",
      priority: "High",
      status: "Failed",
      steps: ["Open dashboard on desktop", "Test on tablet", "Test on mobile", "Verify layout adaptation"],
      expectedResult: "Dashboard should be responsive across devices",
      assignee: "David Lee",
      productId: "PROD005",
      moduleId: "MOD013",
      createdDate: "2024-01-28",
      lastRun: "2024-02-01",
      estimatedTime: 12
    },

    // Report Generation Test Cases (MOD014)
    {
      id: "TC036",
      title: "Automated report scheduling",
      description: "Test automated report generation and scheduling",
      priority: "Medium",
      status: "Not Run",
      steps: ["Schedule report", "Wait for generation", "Verify delivery", "Test different schedules"],
      expectedResult: "Reports should be generated and delivered on schedule",
      assignee: "Mark Anderson",
      productId: "PROD005",
      moduleId: "MOD014",
      createdDate: "2024-01-29",
      lastRun: "Never",
      estimatedTime: 18
    },
    {
      id: "TC037",
      title: "Custom report builder",
      description: "Test custom report creation functionality",
      priority: "High",
      status: "Not Run",
      steps: ["Select data sources", "Configure report layout", "Add filters", "Generate report", "Save template"],
      expectedResult: "Custom reports should be created successfully",
      assignee: "Carol Brown",
      productId: "PROD005",
      moduleId: "MOD014",
      createdDate: "2024-01-29",
      lastRun: "Never",
      estimatedTime: 25
    },

    // Data Export Test Cases (MOD015)
    {
      id: "TC038",
      title: "CSV export functionality",
      description: "Test data export to CSV format",
      priority: "Medium",
      status: "Blocked",
      steps: ["Select data to export", "Choose CSV format", "Download file", "Verify data integrity"],
      expectedResult: "Data should export correctly to CSV",
      assignee: "Carol Brown",
      productId: "PROD005",
      moduleId: "MOD015",
      createdDate: "2024-01-30",
      lastRun: "2024-02-02",
      estimatedTime: 10
    },

    // Customer Management Test Cases (MOD016)
    {
      id: "TC039",
      title: "Customer profile creation",
      description: "Test customer profile creation and management",
      priority: "High",
      status: "Passed",
      steps: ["Create new customer", "Add contact details", "Save profile", "Verify data storage"],
      expectedResult: "Customer profiles should be created successfully",
      assignee: "David Lee",
      productId: "PROD006",
      moduleId: "MOD016",
      createdDate: "2024-01-31",
      lastRun: "2024-02-03",
      estimatedTime: 12
    },
    {
      id: "TC040",
      title: "Customer search and filtering",
      description: "Test customer search and filtering capabilities",
      priority: "Medium",
      status: "Passed",
      steps: ["Search by name", "Filter by criteria", "Sort results", "Test advanced search"],
      expectedResult: "Customer search should work accurately",
      assignee: "Mark Anderson",
      productId: "PROD006",
      moduleId: "MOD016",
      createdDate: "2024-01-31",
      lastRun: "2024-02-03",
      estimatedTime: 15
    },
    {
      id: "TC041",
      title: "Customer interaction history",
      description: "Test customer interaction tracking and history",
      priority: "High",
      status: "Failed",
      steps: ["Log customer interaction", "View interaction history", "Add notes", "Track communication"],
      expectedResult: "All interactions should be tracked properly",
      assignee: "Carol Brown",
      productId: "PROD006",
      moduleId: "MOD016",
      createdDate: "2024-02-01",
      lastRun: "2024-02-04",
      estimatedTime: 18
    },

    // Sales Pipeline Test Cases (MOD017)
    {
      id: "TC042",
      title: "Opportunity creation and tracking",
      description: "Test sales opportunity creation and pipeline tracking",
      priority: "High",
      status: "Not Run",
      steps: ["Create opportunity", "Set pipeline stage", "Update progress", "Track to closure"],
      expectedResult: "Opportunities should be tracked through pipeline",
      assignee: "Carol Brown",
      productId: "PROD006",
      moduleId: "MOD017",
      createdDate: "2024-02-02",
      lastRun: "Never",
      estimatedTime: 20
    },
    {
      id: "TC043",
      title: "Sales forecasting",
      description: "Test sales forecasting and reporting features",
      priority: "Medium",
      status: "Not Run",
      steps: ["Generate forecast", "Verify calculations", "Test different scenarios", "Export forecast"],
      expectedResult: "Sales forecasts should be accurate",
      assignee: "David Lee",
      productId: "PROD006",
      moduleId: "MOD017",
      createdDate: "2024-02-02",
      lastRun: "Never",
      estimatedTime: 22
    },

    // Communication Hub Test Cases (MOD018)
    {
      id: "TC044",
      title: "Email template management",
      description: "Test email template creation and management",
      priority: "Medium",
      status: "Blocked",
      steps: ["Create email template", "Add variables", "Preview template", "Send test email"],
      expectedResult: "Email templates should work correctly",
      assignee: "David Lee",
      productId: "PROD006",
      moduleId: "MOD018",
      createdDate: "2024-02-03",
      lastRun: "2024-02-05",
      estimatedTime: 15
    },
    {
      id: "TC045",
      title: "SMS notification system",
      description: "Test SMS notification delivery and tracking",
      priority: "High",
      status: "Not Run",
      steps: ["Send SMS notification", "Verify delivery", "Track status", "Test delivery failures"],
      expectedResult: "SMS notifications should be delivered reliably",
      assignee: "David Lee",
      productId: "PROD006",
      moduleId: "MOD018",
      createdDate: "2024-02-03",
      lastRun: "Never",
      estimatedTime: 12
    },

    // Additional test cases to reach 50+
    {
      id: "TC046",
      title: "Session timeout handling",
      description: "Test user session timeout and re-authentication",
      priority: "Medium",
      status: "Passed",
      steps: ["Login to system", "Wait for session timeout", "Attempt action", "Verify re-auth prompt"],
      expectedResult: "Session timeout should be handled gracefully",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD001",
      createdDate: "2024-02-04",
      lastRun: "2024-02-06",
      estimatedTime: 10
    },
    {
      id: "TC047",
      title: "Bulk cart operations",
      description: "Test bulk operations on cart items",
      priority: "Low",
      status: "Not Run",
      steps: ["Add multiple items", "Select all items", "Apply bulk action", "Verify results"],
      expectedResult: "Bulk operations should work correctly",
      assignee: "Mark Anderson",
      productId: "PROD001",
      moduleId: "MOD002",
      createdDate: "2024-02-04",
      lastRun: "Never",
      estimatedTime: 8
    },
    {
      id: "TC048",
      title: "Product image gallery",
      description: "Test product image gallery functionality",
      priority: "Low",
      status: "Passed",
      steps: ["View product images", "Navigate gallery", "Zoom images", "Test thumbnails"],
      expectedResult: "Image gallery should work smoothly",
      assignee: "Carol Brown",
      productId: "PROD001",
      moduleId: "MOD003",
      createdDate: "2024-02-05",
      lastRun: "2024-02-07",
      estimatedTime: 6
    },
    {
      id: "TC049",
      title: "Mobile app background sync",
      description: "Test background data synchronization",
      priority: "Medium",
      status: "Failed",
      steps: ["Put app in background", "Make server changes", "Bring app to foreground", "Verify sync"],
      expectedResult: "Background sync should work properly",
      assignee: "David Lee",
      productId: "PROD002",
      moduleId: "MOD006",
      createdDate: "2024-02-05",
      lastRun: "2024-02-08",
      estimatedTime: 15
    },
    {
      id: "TC050",
      title: "API error handling",
      description: "Test API error response handling",
      priority: "High",
      status: "Passed",
      steps: ["Trigger various API errors", "Verify error responses", "Test error codes", "Check error messages"],
      expectedResult: "API errors should be handled consistently",
      assignee: "Mark Anderson",
      productId: "PROD003",
      moduleId: "MOD007",
      createdDate: "2024-02-06",
      lastRun: "2024-02-09",
      estimatedTime: 12
    },
    {
      id: "TC051",
      title: "Payment refund processing",
      description: "Test payment refund functionality",
      priority: "Critical",
      status: "Passed",
      steps: ["Process original payment", "Initiate refund", "Verify refund amount", "Check refund status"],
      expectedResult: "Refunds should be processed correctly",
      assignee: "Carol Brown",
      productId: "PROD004",
      moduleId: "MOD010",
      createdDate: "2024-02-06",
      lastRun: "2024-02-10",
      estimatedTime: 16
    },
    {
      id: "TC052",
      title: "Real-time dashboard updates",
      description: "Test real-time data updates in dashboard",
      priority: "Medium",
      status: "Not Run",
      steps: ["Open dashboard", "Make data changes", "Verify real-time updates", "Test multiple users"],
      expectedResult: "Dashboard should update in real-time",
      assignee: "David Lee",
      productId: "PROD005",
      moduleId: "MOD013",
      createdDate: "2024-02-07",
      lastRun: "Never",
      estimatedTime: 14
    },
    {
      id: "TC053",
      title: "Customer merge functionality",
      description: "Test customer profile merging",
      priority: "Medium",
      status: "Blocked",
      steps: ["Identify duplicate customers", "Initiate merge", "Select master record", "Verify merged data"],
      expectedResult: "Customer profiles should merge correctly",
      assignee: "Mark Anderson",
      productId: "PROD006",
      moduleId: "MOD016",
      createdDate: "2024-02-07",
      lastRun: "2024-02-09",
      estimatedTime: 20
    }
  ],
  testSuites: [
    {
      id: "TS001",
      name: "Authentication Test Suite",
      description: "Complete test suite for user authentication features",
      productId: "PROD001",
      moduleId: "MOD001",
      testCaseIds: ["TC001", "TC002", "TC003", "TC004", "TC005", "TC046"],
      status: "Active",
      createdDate: "2024-01-10",
      lastModified: "2024-02-04",
      owner: "Carol Brown"
    },
    {
      id: "TS002",
      name: "E-commerce Checkout Suite",
      description: "Test suite covering shopping cart and payment processes",
      productId: "PROD001",
      moduleId: "MOD002",
      testCaseIds: ["TC006", "TC007", "TC008", "TC009", "TC010", "TC047"],
      status: "Active",
      createdDate: "2024-01-12",
      lastModified: "2024-02-04",
      owner: "Mark Anderson"
    },
    {
      id: "TS003",
      name: "Product Catalog Suite",
      description: "Test suite for product browsing and search functionality",
      productId: "PROD001",
      moduleId: "MOD003",
      testCaseIds: ["TC011", "TC012", "TC013", "TC048"],
      status: "Active",
      createdDate: "2024-01-14",
      lastModified: "2024-02-05",
      owner: "Carol Brown"
    },
    {
      id: "TS004",
      name: "Mobile Application Suite",
      description: "Comprehensive mobile app testing suite",
      productId: "PROD002",
      moduleId: "MOD004",
      testCaseIds: ["TC014", "TC015", "TC016"],
      status: "Active",
      createdDate: "2024-01-16",
      lastModified: "2024-01-21",
      owner: "David Lee"
    },
    {
      id: "TS005",
      name: "Mobile Features Suite",
      description: "Advanced mobile features testing",
      productId: "PROD002",
      moduleId: "MOD005",
      testCaseIds: ["TC017", "TC018", "TC019", "TC020", "TC049"],
      status: "Active",
      createdDate: "2024-01-18",
      lastModified: "2024-02-05",
      owner: "David Lee"
    },
    {
      id: "TS006",
      name: "API Integration Suite",
      description: "Backend API testing suite",
      productId: "PROD003",
      moduleId: "MOD007",
      testCaseIds: ["TC021", "TC022", "TC023", "TC050"],
      status: "Active",
      createdDate: "2024-01-20",
      lastModified: "2024-02-06",
      owner: "Mark Anderson"
    },
    {
      id: "TS007",
      name: "Microservices Suite",
      description: "User and order service testing",
      productId: "PROD003",
      moduleId: "MOD008",
      testCaseIds: ["TC024", "TC025", "TC026", "TC027"],
      status: "Inactive",
      createdDate: "2024-01-22",
      lastModified: "2024-01-26",
      owner: "Carol Brown"
    },
    {
      id: "TS008",
      name: "Payment Processing Suite",
      description: "Complete payment system testing",
      productId: "PROD004",
      moduleId: "MOD010",
      testCaseIds: ["TC028", "TC029", "TC030", "TC051"],
      status: "Active",
      createdDate: "2024-01-24",
      lastModified: "2024-02-06",
      owner: "Carol Brown"
    },
    {
      id: "TS009",
      name: "Fraud and Analytics Suite",
      description: "Fraud detection and payment analytics testing",
      productId: "PROD004",
      moduleId: "MOD011",
      testCaseIds: ["TC031", "TC032", "TC033"],
      status: "Active",
      createdDate: "2024-01-26",
      lastModified: "2024-01-31",
      owner: "David Lee"
    },
    {
      id: "TS010",
      name: "Business Intelligence Suite",
      description: "Analytics and reporting functionality testing",
      productId: "PROD005",
      moduleId: "MOD013",
      testCaseIds: ["TC034", "TC035", "TC036", "TC037", "TC038", "TC052"],
      status: "Active",
      createdDate: "2024-01-28",
      lastModified: "2024-02-07",
      owner: "Carol Brown"
    },
    {
      id: "TS011",
      name: "CRM Core Suite",
      description: "Customer relationship management core features",
      productId: "PROD006",
      moduleId: "MOD016",
      testCaseIds: ["TC039", "TC040", "TC041", "TC053"],
      status: "Active",
      createdDate: "2024-01-31",
      lastModified: "2024-02-07",
      owner: "David Lee"
    },
    {
      id: "TS012",
      name: "CRM Advanced Suite", 
      description: "Advanced CRM features including sales and communication",
      productId: "PROD006",
      moduleId: "MOD017",
      testCaseIds: ["TC042", "TC043", "TC044", "TC045"],
      status: "Inactive",
      createdDate: "2024-02-02",
      lastModified: "2024-02-05",
      owner: "Carol Brown"
    }
  ]
};

const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    addTestCase: (state, action: PayloadAction<Omit<TestCase, 'id' | 'createdDate' | 'lastRun'>>) => {
      const newTestCase: TestCase = {
        ...action.payload,
        id: `TC${String(state.testCases.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastRun: "Never"
      };
      state.testCases.push(newTestCase);
    },
    updateTestCase: (state, action: PayloadAction<{ id: string; updates: Partial<TestCase> }>) => {
      const { id, updates } = action.payload;
      const index = state.testCases.findIndex(testCase => testCase.id === id);
      if (index !== -1) {
        state.testCases[index] = { ...state.testCases[index], ...updates };
      }
    },
    deleteTestCase: (state, action: PayloadAction<string>) => {
      const testCaseId = action.payload;
      state.testCases = state.testCases.filter(testCase => testCase.id !== testCaseId);
      // Remove from test suites
      state.testSuites.forEach(suite => {
        suite.testCaseIds = suite.testCaseIds.filter(id => id !== testCaseId);
      });
    },
    addTestSuite: (state, action: PayloadAction<Omit<TestSuite, 'id' | 'createdDate' | 'lastModified'>>) => {
      const newTestSuite: TestSuite = {
        ...action.payload,
        id: `TS${String(state.testSuites.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      state.testSuites.push(newTestSuite);
    },
    updateTestSuite: (state, action: PayloadAction<{ id: string; updates: Partial<TestSuite> }>) => {
      const { id, updates } = action.payload;
      const index = state.testSuites.findIndex(testSuite => testSuite.id === id);
      if (index !== -1) {
        state.testSuites[index] = {
          ...state.testSuites[index],
          ...updates,
          lastModified: new Date().toISOString().split('T')[0]
        };
      }
    },
    deleteTestSuite: (state, action: PayloadAction<string>) => {
      state.testSuites = state.testSuites.filter(testSuite => testSuite.id !== action.payload);
    },
    addTestCaseToSuite: (state, action: PayloadAction<{ suiteId: string; testCaseId: string }>) => {
      const { suiteId, testCaseId } = action.payload;
      const suite = state.testSuites.find(s => s.id === suiteId);
      if (suite && !suite.testCaseIds.includes(testCaseId)) {
        suite.testCaseIds.push(testCaseId);
        suite.lastModified = new Date().toISOString().split('T')[0];
      }
    },
    removeTestCaseFromSuite: (state, action: PayloadAction<{ suiteId: string; testCaseId: string }>) => {
      const { suiteId, testCaseId } = action.payload;
      const suite = state.testSuites.find(s => s.id === suiteId);
      if (suite) {
        suite.testCaseIds = suite.testCaseIds.filter(id => id !== testCaseId);
        suite.lastModified = new Date().toISOString().split('T')[0];
      }
    }
  }
});

export const {
  addTestCase,
  updateTestCase,
  deleteTestCase,
  addTestSuite,
  updateTestSuite,
  deleteTestSuite,
  addTestCaseToSuite,
  removeTestCaseFromSuite
} = testSlice.actions;

export default testSlice.reducer;
