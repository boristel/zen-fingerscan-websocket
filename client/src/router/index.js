import { createRouter, createWebHistory } from 'vue-router'
import RegisterFingerprint from '../views/RegisterFingerprint.vue'
import AttendanceModule from '../views/AttendanceModule.vue'

const routes = [
  {
    path: '/',
    name: 'RegisterFingerprint',
    component: RegisterFingerprint,
    meta: {
      title: 'Register Fingerprint'
    }
  },
  {
    path: '/attendance',
    name: 'AttendanceModule',
    component: AttendanceModule,
    meta: {
      title: 'Attendance'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard to set page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Fingerprint Attendance` : 'Fingerprint Attendance'
  next()
})

export default router