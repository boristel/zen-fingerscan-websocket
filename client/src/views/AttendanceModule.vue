<template>
  <div class="attendance-module">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">
          <i class="bi bi-clock-history"></i>
          Attendance Module
        </h1>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="bi bi-info-circle"></i>
              Attendance Module
            </h5>
          </div>
          <div class="card-body text-center">
            <i class="bi bi-tools display-1 text-muted mb-3"></i>
            <h4>Coming Soon</h4>
            <p class="text-muted">
              The attendance module will be implemented in the next phase.
              This will include fingerprint scanning for check-in/check-out,
              attendance reports, and employee attendance history.
            </p>
            <button class="btn btn-primary" disabled>
              <i class="bi bi-clock"></i>
              Check In/Out (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttendanceModule'
}
</script>