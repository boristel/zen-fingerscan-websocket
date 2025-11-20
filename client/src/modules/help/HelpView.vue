<template>
  <div class="help-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Help & Support</h2>
        <p class="text-muted mb-0">Find answers and get assistance</p>
      </div>
      <div>
        <button class="btn btn-primary" @click="contactSupport">
          <i class="bi bi-headset me-2"></i>Contact Support
        </button>
      </div>
    </div>

    <!-- Search Help -->
    <div class="card mb-4">
      <div class="card-body text-center">
        <h4 class="mb-3">How can we help you?</h4>
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="input-group input-group-lg">
              <input
                type="text"
                class="form-control"
                placeholder="Search for help articles, tutorials, and FAQs..."
                v-model="searchQuery"
                @input="searchHelp"
              >
              <button class="btn btn-primary" type="button">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <div class="text-primary mb-3">
              <i class="bi bi-book fs-1"></i>
            </div>
            <h5 class="card-title">User Guide</h5>
            <p class="card-text">Complete user manual and documentation</p>
            <button class="btn btn-outline-primary" @click="openUserGuide">
              Open Guide
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <div class="text-success mb-3">
              <i class="bi bi-play-circle fs-1"></i>
            </div>
            <h5 class="card-title">Video Tutorials</h5>
            <p class="card-text">Step-by-step video guides</p>
            <button class="btn btn-outline-success" @click="openTutorials">
              Watch Videos
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <div class="text-info mb-3">
              <i class="bi bi-question-circle fs-1"></i>
            </div>
            <h5 class="card-title">FAQs</h5>
            <p class="card-text">Frequently asked questions</p>
            <button class="btn btn-outline-info" @click="openFAQs">
              View FAQs
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center h-100">
          <div class="card-body">
            <div class="text-warning mb-3">
              <i class="bi bi-headset fs-1"></i>
            </div>
            <h5 class="card-title">Support</h5>
            <p class="card-text">Get help from our support team</p>
            <button class="btn btn-outline-warning" @click="contactSupport">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Categories -->
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Help Categories</h5>

            <!-- Getting Started -->
            <div class="mb-4">
              <h6 class="text-primary mb-3">
                <i class="bi bi-rocket-takeoff me-2"></i>Getting Started
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('system-overview')">
                        <i class="bi bi-chevron-right me-2"></i>System Overview
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('first-login')">
                        <i class="bi bi-chevron-right me-2"></i>First Time Login
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('user-profile')">
                        <i class="bi bi-chevron-right me-2"></i>Managing Your Profile
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('navigation')">
                        <i class="bi bi-chevron-right me-2"></i>System Navigation
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('basic-features')">
                        <i class="bi bi-chevron-right me-2"></i>Basic Features
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('keyboard-shortcuts')">
                        <i class="bi bi-chevron-right me-2"></i>Keyboard Shortcuts
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('personalization')">
                        <i class="bi bi-chevron-right me-2"></i>Personalization
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('notifications')">
                        <i class="bi bi-chevron-right me-2"></i>Notifications
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Attendance Management -->
            <div class="mb-4">
              <h6 class="text-success mb-3">
                <i class="bi bi-calendar-check me-2"></i>Attendance Management
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('clock-in-out')">
                        <i class="bi bi-chevron-right me-2"></i>Clock In/Out
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('view-attendance')">
                        <i class="bi bi-chevron-right me-2"></i>View Attendance History
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('leave-request')">
                        <i class="bi bi-chevron-right me-2"></i>Leave Requests
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('overtime')">
                        <i class="bi bi-chevron-right me-2"></i>Overtime Management
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('attendance-correction')">
                        <i class="bi bi-chevron-right me-2"></i>Attendance Corrections
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('shift-management')">
                        <i class="bi bi-chevron-right me-2"></i>Shift Management
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('attendance-reports')">
                        <i class="bi bi-chevron-right me-2"></i>Attendance Reports
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('attendance-analytics')">
                        <i class="bi bi-chevron-right me-2"></i>Attendance Analytics
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Biometric Management -->
            <div class="mb-4">
              <h6 class="text-info mb-3">
                <i class="bi bi-fingerprint me-2"></i>Biometric Management
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('fingerprint-enrollment')">
                        <i class="bi bi-chevron-right me-2"></i>Fingerprint Enrollment
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('biometric-verification')">
                        <i class="bi bi-chevron-right me-2"></i>Biometric Verification
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('scanner-setup')">
                        <i class="bi bi-chevron-right me-2"></i>Scanner Setup
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('biometric-security')">
                        <i class="bi bi-chevron-right me-2"></i>Biometric Security
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('troubleshooting-scanner')">
                        <i class="bi bi-chevron-right me-2"></i>Scanner Troubleshooting
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('biometric-privacy')">
                        <i class="bi bi-chevron-right me-2"></i>Biometric Privacy
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('backup-restore')">
                        <i class="bi bi-chevron-right me-2"></i>Backup & Restore
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('biometric-policies')">
                        <i class="bi bi-chevron-right me-2"></i>Biometric Policies
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- System Administration -->
            <div class="mb-4">
              <h6 class="text-warning mb-3">
                <i class="bi bi-gear me-2"></i>System Administration
              </h6>
              <div class="row">
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('user-management')">
                        <i class="bi bi-chevron-right me-2"></i>User Management
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('role-permissions')">
                        <i class="bi bi-chevron-right me-2"></i>Roles & Permissions
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('system-settings')">
                        <i class="bi bi-chevron-right me-2"></i>System Settings
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('backup-system')">
                        <i class="bi bi-chevron-right me-2"></i>System Backup
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="list-unstyled">
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('audit-logs')">
                        <i class="bi bi-chevron-right me-2"></i>Audit Logs
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('security-settings')">
                        <i class="bi bi-chevron-right me-2"></i>Security Settings
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('maintenance')">
                        <i class="bi bi-chevron-right me-2"></i>System Maintenance
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="text-decoration-none" @click="openArticle('troubleshooting')">
                        <i class="bi bi-chevron-right me-2"></i>Troubleshooting
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <!-- Popular Articles -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title mb-3">Popular Articles</h5>
            <div class="list-group list-group-flush">
              <a href="#" class="list-group-item list-group-item-action border-0" @click="openArticle('clock-in-out')">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">How to Clock In/Out</h6>
                    <small class="text-muted">Step-by-step guide for marking attendance</small>
                  </div>
                  <span class="badge bg-primary rounded-pill">Hot</span>
                </div>
              </a>
              <a href="#" class="list-group-item list-group-item-action border-0" @click="openArticle('fingerprint-enrollment')">
                <h6 class="mb-1">Fingerprint Enrollment Process</h6>
                <small class="text-muted">Complete guide for registering fingerprints</small>
              </a>
              <a href="#" class="list-group-item list-group-item-action border-0" @click="openArticle('attendance-reports')">
                <h6 class="mb-1">Generating Attendance Reports</h6>
                <small class="text-muted">How to create and export reports</small>
              </a>
              <a href="#" class="list-group-item list-group-item-action border-0" @click="openArticle('reset-password')">
                <h6 class="mb-1">Reset Your Password</h6>
                <small class="text-muted">Steps to recover your account</small>
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Support -->
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Need More Help?</h5>
            <p class="text-muted mb-3">Can't find what you're looking for? Our support team is here to help.</p>

            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="contactSupport">
                <i class="bi bi-headset me-2"></i>Contact Support
              </button>
              <button class="btn btn-outline-info" @click="submitTicket">
                <i class="bi bi-ticket-detailed me-2"></i>Submit Support Ticket
              </button>
              <button class="btn btn-outline-success" @click="liveChat">
                <i class="bi bi-chat-dots me-2"></i>Start Live Chat
              </button>
            </div>

            <div class="mt-3 text-center">
              <small class="text-muted">
                <strong>Support Hours:</strong><br>
                Monday - Friday: 9:00 AM - 6:00 PM<br>
                Email: support@company.com<br>
                Phone: +1-800-123-4567
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Ticket Modal -->
    <div class="modal fade" id="ticketModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Submit Support Ticket</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">Subject</label>
              <input type="text" class="form-control" v-model="ticket.subject" placeholder="Brief description of your issue">
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Category</label>
              <select class="form-select" v-model="ticket.category">
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="account">Account Problem</option>
                <option value="biometric">Biometric Issue</option>
                <option value="attendance">Attendance Problem</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Priority</label>
              <select class="form-select" v-model="ticket.priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Description</label>
              <textarea class="form-control" v-model="ticket.description" rows="5" placeholder="Please provide detailed information about your issue..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Attachment (optional)</label>
              <input type="file" class="form-control" @change="handleFileUpload">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitTicketForm">
              <i class="bi bi-send me-2"></i>Submit Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'HelpView',
  setup() {
    // Data
    const searchQuery = ref('')
    const ticket = ref({
      subject: '',
      category: '',
      priority: 'medium',
      description: '',
      attachment: null
    })

    // Methods
    const searchHelp = () => {
      console.log('Searching help for:', searchQuery.value)
      // Implement help search functionality
    }

    const openUserGuide = () => {
      console.log('Opening user guide...')
      // Open user guide PDF or navigate to guide page
    }

    const openTutorials = () => {
      console.log('Opening video tutorials...')
      // Navigate to video tutorials page
    }

    const openFAQs = () => {
      console.log('Opening FAQs...')
      // Navigate to FAQ page
    }

    const openArticle = (articleId) => {
      console.log('Opening article:', articleId)
      // Navigate to specific help article
    }

    const contactSupport = () => {
      console.log('Contacting support...')
      // Open contact support page or form
    }

    const submitTicket = () => {
      // Show ticket modal
      console.log('Opening support ticket form...')
    }

    const liveChat = () => {
      console.log('Starting live chat...')
      // Open live chat widget
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        ticket.value.attachment = file
        console.log('File uploaded:', file.name)
      }
    }

    const submitTicketForm = async () => {
      try {
        // Validate ticket data
        if (!ticket.value.subject || !ticket.value.category || !ticket.value.description) {
          alert('Please fill in all required fields.')
          return
        }

        console.log('Submitting support ticket:', ticket.value)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        alert('Support ticket submitted successfully! We will get back to you within 24 hours.')

        // Reset form
        ticket.value = {
          subject: '',
          category: '',
          priority: 'medium',
          description: '',
          attachment: null
        }

        // Close modal
      } catch (error) {
        console.error('Error submitting ticket:', error)
        alert('Failed to submit ticket. Please try again.')
      }
    }

    // Lifecycle
    onMounted(() => {
      console.log('Help view loaded')
    })

    return {
      searchQuery,
      ticket,
      searchHelp,
      openUserGuide,
      openTutorials,
      openFAQs,
      openArticle,
      contactSupport,
      submitTicket,
      liveChat,
      handleFileUpload,
      submitTicketForm
    }
  }
}
</script>

<style scoped>
.help-view {
  padding: 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1rem;
}

.list-group-item {
  border: none;
  padding: 0.75rem 0;
}

.list-group-item:hover {
  background-color: transparent;
  color: #007bff;
}

.list-unstyled li a {
  color: #495057;
  text-decoration: none;
  display: block;
  padding: 0.25rem 0;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.list-unstyled li a:hover {
  color: #007bff;
  background-color: #f8f9fa;
  padding-left: 0.5rem;
}

.btn {
  border-radius: 0.375rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.badge {
  font-size: 0.75rem;
}

i.fs-1 {
  font-size: 2.5rem;
}

.modal-content {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
}

/* Add hover effects for cards */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

/* Custom colors for sections */
.text-primary { color: #007bff !important; }
.text-success { color: #198754 !important; }
.text-info { color: #17a2b8 !important; }
.text-warning { color: #ffc107 !important; }
</style>