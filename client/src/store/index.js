import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    loading: state => state.loading,
    error: state => state.error
  },

  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },

    SET_ERROR(state, error) {
      state.error = error
    },

    CLEAR_ERROR(state) {
      state.error = null
    },

    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },

    CLEAR_AUTH(state) {
      state.user = null
      state.isAuthenticated = false
    }
  },

  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },

    setError({ commit }, error) {
      commit('SET_ERROR', error)
      setTimeout(() => {
        commit('CLEAR_ERROR')
      }, 5000)
    },

    clearError({ commit }) {
      commit('CLEAR_ERROR')
    },

    // Authentication actions can be added here if needed
    setUser({ commit }, user) {
      commit('SET_USER', user)
    },

    logout({ commit }) {
      commit('CLEAR_AUTH')
      localStorage.removeItem('auth_token')
    }
  }
})