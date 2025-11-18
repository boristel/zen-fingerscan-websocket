<template>
  <div class="on-screen-keyboard" :class="{ visible: isVisible }">
    <!-- Keyboard Toggle Button -->
    <button
      @click="toggleKeyboard"
      class="keyboard-toggle-btn"
      :class="{ active: isVisible }"
      :title="isVisible ? 'Hide Keyboard' : 'Show Keyboard'"
    >
      <i class="bi" :class="isVisible ? 'bi-keyboard-fill' : 'bi-keyboard'"></i>
      <span>{{ isVisible ? 'Hide' : 'Show' }} Keyboard</span>
    </button>

    <!-- Keyboard Container -->
    <div v-if="isVisible" class="keyboard-container">
      <!-- Type Selector -->
      <div class="keyboard-type-selector">
        <button
          @click="keyboardType = 'numpad'"
          :class="{ active: keyboardType === 'numpad' }"
          class="type-btn"
        >
          <i class="bi bi-123"></i>
          Numpad
        </button>
        <button
          @click="keyboardType = 'full'"
          :class="{ active: keyboardType === 'full' }"
          class="type-btn"
        >
          <i class="bi bi-keyboard"></i>
          Full Keyboard
        </button>
      </div>

      <!-- Numpad Keyboard -->
      <div v-if="keyboardType === 'numpad'" class="numpad-keyboard">
        <div class="keyboard-row">
          <button @click="addCharacter('7')" class="key">7</button>
          <button @click="addCharacter('8')" class="key">8</button>
          <button @click="addCharacter('9')" class="key">9</button>
        </div>
        <div class="keyboard-row">
          <button @click="addCharacter('4')" class="key">4</button>
          <button @click="addCharacter('5')" class="key">5</button>
          <button @click="addCharacter('6')" class="key">6</button>
        </div>
        <div class="keyboard-row">
          <button @click="addCharacter('1')" class="key">1</button>
          <button @click="addCharacter('2')" class="key">2</button>
          <button @click="addCharacter('3')" class="key">3</button>
        </div>
        <div class="keyboard-row">
          <button @click="clearInput" class="key special">Clear</button>
          <button @click="addCharacter('0')" class="key">0</button>
          <button @click="deleteLastCharacter" class="key special">
            <i class="bi bi-backspace"></i>
          </button>
        </div>
      </div>

      <!-- Full Keyboard -->
      <div v-if="keyboardType === 'full'" class="full-keyboard">
        <!-- Number Row -->
        <div class="keyboard-row">
          <button @click="addCharacter('1')" class="key">1</button>
          <button @click="addCharacter('2')" class="key">2</button>
          <button @click="addCharacter('3')" class="key">3</button>
          <button @click="addCharacter('4')" class="key">4</button>
          <button @click="addCharacter('5')" class="key">5</button>
          <button @click="addCharacter('6')" class="key">6</button>
          <button @click="addCharacter('7')" class="key">7</button>
          <button @click="addCharacter('8')" class="key">8</button>
          <button @click="addCharacter('9')" class="key">9</button>
          <button @click="addCharacter('0')" class="key">0</button>
          <button @click="deleteLastCharacter" class="key special">
            <i class="bi bi-backspace"></i>
          </button>
        </div>

        <!-- QWERTY Row -->
        <div class="keyboard-row">
          <button @click="addCharacter('Q')" class="key">Q</button>
          <button @click="addCharacter('W')" class="key">W</button>
          <button @click="addCharacter('E')" class="key">E</button>
          <button @click="addCharacter('R')" class="key">R</button>
          <button @click="addCharacter('T')" class="key">T</button>
          <button @click="addCharacter('Y')" class="key">Y</button>
          <button @click="addCharacter('U')" class="key">U</button>
          <button @click="addCharacter('I')" class="key">I</button>
          <button @click="addCharacter('O')" class="key">O</button>
          <button @click="addCharacter('P')" class="key">P</button>
        </div>

        <!-- ASDF Row -->
        <div class="keyboard-row">
          <button @click="addCharacter('A')" class="key">A</button>
          <button @click="addCharacter('S')" class="key">S</button>
          <button @click="addCharacter('D')" class="key">D</button>
          <button @click="addCharacter('F')" class="key">F</button>
          <button @click="addCharacter('G')" class="key">G</button>
          <button @click="addCharacter('H')" class="key">H</button>
          <button @click="addCharacter('J')" class="key">J</button>
          <button @click="addCharacter('K')" class="key">K</button>
          <button @click="addCharacter('L')" class="key">L</button>
        </div>

        <!-- ZXCV Row -->
        <div class="keyboard-row">
          <button @click="addCharacter('Z')" class="key">Z</button>
          <button @click="addCharacter('X')" class="key">X</button>
          <button @click="addCharacter('C')" class="key">C</button>
          <button @click="addCharacter('V')" class="key">V</button>
          <button @click="addCharacter('B')" class="key">B</button>
          <button @click="addCharacter('N')" class="key">N</button>
          <button @click="addCharacter('M')" class="key">M</button>
        </div>

        <!-- Space and Actions Row -->
        <div class="keyboard-row">
          <button @click="toggleCase" class="key special wide">
            <i class="bi bi-capslock"></i>
            {{ isUpperCase ? 'LOWER' : 'UPPER' }}
          </button>
          <button @click="addCharacter(' ')" class="key space">SPACE</button>
          <button @click="clearInput" class="key special">Clear</button>
          <button @click="triggerEnter" class="key special enter">
            <i class="bi bi-arrow-return-left"></i>
            Enter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'OnScreenKeyboard',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    targetInput: {
      type: Object,
      default: null
    },
    autoShow: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'character-added', 'enter-pressed'],
  setup(props, { emit }) {
    const isVisible = ref(props.autoShow)
    const keyboardType = ref('numpad')
    const isUpperCase = ref(false)

    // Methods
    const toggleKeyboard = () => {
      isVisible.value = !isVisible.value
    }

    const addCharacter = (char) => {
      let charToAdd = char

      if (isUpperCase.value && char !== ' ' && !/^\d$/.test(char)) {
        charToAdd = char.toUpperCase()
      } else if (!isUpperCase.value && char !== ' ' && !/^\d$/.test(char)) {
        charToAdd = char.toLowerCase()
      }

      const newValue = props.modelValue + charToAdd
      emit('update:modelValue', newValue)
      emit('character-added', charToAdd)

      // Visual feedback
      if (props.targetInput && props.targetInput.focus) {
        props.targetInput.focus()
      }
    }

    const deleteLastCharacter = () => {
      if (props.modelValue.length > 0) {
        const newValue = props.modelValue.slice(0, -1)
        emit('update:modelValue', newValue)
      }
    }

    const clearInput = () => {
      emit('update:modelValue', '')
    }

    const toggleCase = () => {
      isUpperCase.value = !isUpperCase.value
    }

    const triggerEnter = () => {
      emit('enter-pressed')
    }

    const showKeyboard = () => {
      isVisible.value = true
    }

    const hideKeyboard = () => {
      isVisible.value = false
    }

    // Auto-hide keyboard when clicking outside
    const handleClickOutside = (event) => {
      const keyboardElement = document.querySelector('.on-screen-keyboard')
      if (keyboardElement && !keyboardElement.contains(event.target)) {
        isVisible.value = false
      }
    }

    // Add click outside listener when keyboard is visible
    watch(isVisible, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          document.addEventListener('click', handleClickOutside)
        }, 100)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    return {
      isVisible,
      keyboardType,
      isUpperCase,
      toggleKeyboard,
      addCharacter,
      deleteLastCharacter,
      clearInput,
      toggleCase,
      triggerEnter,
      showKeyboard,
      hideKeyboard
    }
  }
}
</script>

<style scoped>
.on-screen-keyboard {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.keyboard-toggle-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.keyboard-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.keyboard-toggle-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.keyboard-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  max-width: 600px;
  margin-bottom: 10px;
}

.keyboard-type-selector {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.type-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: #666;
  transition: all 0.3s ease;
}

.type-btn:hover {
  background: #e8e8e8;
}

.type-btn.active {
  background: white;
  color: #667eea;
  border-bottom: 3px solid #667eea;
}

.numpad-keyboard,
.full-keyboard {
  padding: 15px;
}

.keyboard-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  justify-content: center;
}

.key {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.key:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.key:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.key.special {
  background: #f8f9fa;
  color: #495057;
  border-color: #dee2e6;
}

.key.special:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.key.wide {
  min-width: 100px;
}

.key.space {
  min-width: 200px;
}

.key.enter {
  min-width: 120px;
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.key.enter:hover {
  background: #218838;
  border-color: #218838;
  color: white;
}

/* Numpad specific styles */
.numpad-keyboard .keyboard-row .key {
  min-width: 60px;
  padding: 20px;
  font-size: 18px;
}

.numpad-keyboard .key.special {
  min-width: 80px;
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.numpad-keyboard .key.special:hover {
  background: #e0a800;
  border-color: #e0a800;
  color: white;
}

/* Touch device optimizations */
@media (hover: none) {
  .key {
    min-height: 50px;
  }

  .numpad-keyboard .key {
    min-height: 60px;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .on-screen-keyboard {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .keyboard-container {
    max-width: 100%;
  }

  .key {
    min-width: 35px;
    padding: 12px;
    font-size: 14px;
  }

  .numpad-keyboard .key {
    min-width: 50px;
    padding: 18px;
    font-size: 16px;
  }

  .key.space {
    min-width: 150px;
  }

  .key.enter {
    min-width: 100px;
  }
}
</style>