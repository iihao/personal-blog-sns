<template>
  <label class="toggle-switch" :class="{ 'checked': modelValue, 'disabled': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="toggle-input"
    />
    <span class="toggle-slider"></span>
  </label>
</template>

<script>
export default {
  name: 'ToggleSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 32px;
  vertical-align: middle;
  cursor: pointer;
}

.toggle-switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 32px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  left: 2px;
  top: 2px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.checked .toggle-slider {
  background-color: var(--success);
  border-color: var(--success);
}

.toggle-switch.checked .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-switch:hover:not(.disabled) .toggle-slider {
  border-color: var(--text-tertiary);
}

.toggle-switch.checked:hover:not(.disabled) .toggle-slider {
  background-color: #2db84f;
  border-color: #2db84f;
}

/* Dark mode adjustments */
:deep(.dark) .toggle-slider::before {
  background-color: #e5e5e5;
}

:deep(.dark) .toggle-switch.checked .toggle-slider {
  background-color: #30d158;
  border-color: #30d158;
}
</style>
