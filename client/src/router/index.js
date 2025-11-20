/**
 * Simple Vue Router Configuration for Fingerprint Attendance System
 * Only 2 modules: Attendance and Registration
 */

import { createRouter, createWebHistory } from 'vue-router'

// Import views
import AttendanceModule from '../views/AttendanceModule.vue'
import RegisterFingerprint from '../views/RegisterFingerprint.vue'

const routes = [
  // Redirect root to attendance module (main page)
  {
    path: '/',
    redirect: '/attendance'
  },

  // Attendance Module - Main page
  {
    path: '/attendance',
    name: 'Attendance',
    component: AttendanceModule,
    meta: {
      title: 'Attendance Module',
      description: 'Employee fingerprint attendance system'
    }
  },

  // Registration Module - Password protected
  {
    path: '/register',
    name: 'Register',
    component: RegisterFingerprint,
    meta: {
      title: 'Fingerprint Registration',
      description: 'Register employee fingerprints'
    }
  },

  // Catch-all route - redirect to attendance
  {
    path: '/:pathMatch(.*)*',
    redirect: '/attendance'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || '/'),
  routes
})

export default router