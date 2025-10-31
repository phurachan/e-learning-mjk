<template>
  <div class="rich-text-editor">
    <label v-if="label" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>

    <ClientOnly>
      <div v-if="editor" class="border rounded-lg bg-base-100">
        <!-- Toolbar -->
        <div class="border-b bg-base-200 p-2 flex flex-wrap gap-1">
          <!-- Text formatting -->
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('bold') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Bold"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('italic') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Italic"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-4 16h4M13 4L11 20"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('underline') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Underline"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18h12M6 4v7a6 6 0 0012 0V4"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('strike') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Strikethrough"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12M9 5h6a3 3 0 010 6H9z M9 19h6a3 3 0 000-6H9z"></path>
            </svg>
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Headings -->
          <button
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('heading', { level: 1 }) }"
            class="btn btn-xs"
            type="button"
            title="Heading 1"
          >
            H1
          </button>

          <button
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('heading', { level: 2 }) }"
            class="btn btn-xs"
            type="button"
            title="Heading 2"
          >
            H2
          </button>

          <button
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('heading', { level: 3 }) }"
            class="btn btn-xs"
            type="button"
            title="Heading 3"
          >
            H3
          </button>

          <button
            @click="editor.chain().focus().setParagraph().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('paragraph') }"
            class="btn btn-xs"
            type="button"
            title="Paragraph"
          >
            P
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Lists -->
          <button
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('bulletList') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Bullet List"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('orderedList') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Numbered List"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h.01M3 8h.01M3 12h.01M8 4h13M8 8h13M8 12h13"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive('blockquote') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Blockquote"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3-3 3 3m0 6l-3 3-3-3M3 12h18"></path>
            </svg>
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Alignment -->
          <button
            @click="editor.chain().focus().setTextAlign('left').run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive({ textAlign: 'left' }) }"
            class="btn btn-xs btn-square"
            type="button"
            title="Align Left"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().setTextAlign('center').run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive({ textAlign: 'center' }) }"
            class="btn btn-xs btn-square"
            type="button"
            title="Align Center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M4 18h16"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().setTextAlign('right').run()"
            :class="{ 'bg-primary text-primary-content': editor.isActive({ textAlign: 'right' }) }"
            class="btn btn-xs btn-square"
            type="button"
            title="Align Right"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M4 18h16"></path>
            </svg>
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Text Indent -->
          <button
            @click="toggleIndent"
            class="btn btn-xs"
            type="button"
            title="ย่อหน้า"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Link -->
          <button
            @click="setLink"
            :class="{ 'bg-primary text-primary-content': editor.isActive('link') }"
            class="btn btn-xs btn-square"
            type="button"
            title="Insert Link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </button>

          <!-- Image -->
          <button
            @click="addImage"
            class="btn btn-xs btn-square"
            type="button"
            title="Insert Image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </button>

          <!-- Horizontal Rule -->
          <button
            @click="editor.chain().focus().setHorizontalRule().run()"
            class="btn btn-xs btn-square"
            type="button"
            title="Horizontal Rule"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path>
            </svg>
          </button>

          <div class="divider divider-horizontal m-0"></div>

          <!-- Undo/Redo -->
          <button
            @click="editor.chain().focus().undo().run()"
            :disabled="!editor.can().undo()"
            class="btn btn-xs btn-square"
            type="button"
            title="Undo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
            </svg>
          </button>

          <button
            @click="editor.chain().focus().redo().run()"
            :disabled="!editor.can().redo()"
            class="btn btn-xs btn-square"
            type="button"
            title="Redo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"></path>
            </svg>
          </button>
        </div>

        <!-- Editor Content -->
        <EditorContent :editor="editor" class="prose max-w-none p-4 min-h-[300px] focus:outline-none" />
      </div>
    </ClientOnly>

    <label v-if="error" class="label">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>

    <!-- Image URL Input Modal -->
    <div v-if="showImageModal" ref="imagePickerRef" class="mt-4 border rounded-lg bg-base-200 p-4">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-lg">แทรกรูปภาพ</h4>
        <button @click="closeImageModal" class="btn btn-sm btn-circle btn-ghost" type="button">
          ✕
        </button>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">URL รูปภาพ</span>
        </label>
        <input
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          class="input input-bordered w-full"
        />
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button @click="closeImageModal" class="btn btn-ghost btn-sm" type="button">
          ยกเลิก
        </button>
        <button @click="insertSelectedImage" class="btn btn-primary btn-sm" type="button">
          แทรกรูปภาพ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'

interface Props {
  modelValue?: string
  label?: string
  required?: boolean
  error?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'เขียนเนื้อหา...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// State for image modal
const showImageModal = ref(false)
const imageUrl = ref('')
const imagePickerRef = ref<HTMLElement | null>(null)

// Custom Paragraph extension with class support
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) {
            return {}
          }
          return { class: attributes.class }
        }
      }
    }
  }
})

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      paragraph: false, // Disable default paragraph (using CustomParagraph instead)
      heading: {
        levels: [1, 2, 3]
      }
    }),
    CustomParagraph,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    TextStyle,
    Color,
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg my-4'
      }
    })
  ],
  editorProps: {
    attributes: {
      class: 'prose max-w-none focus:outline-none'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Set link function
const setLink = () => {
  if (!editor.value) return

  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update link
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Add image function
const addImage = () => {
  showImageModal.value = true

  // Scroll to image picker after it's rendered
  nextTick(() => {
    if (imagePickerRef.value) {
      imagePickerRef.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

// Close image modal
const closeImageModal = () => {
  showImageModal.value = false
  imageUrl.value = ''
}

// Insert selected image
const insertSelectedImage = () => {
  if (!editor.value || !imageUrl.value) return

  editor.value.chain().focus().setImage({ src: imageUrl.value }).run()

  closeImageModal()
}

// Toggle indent function
const toggleIndent = () => {
  if (!editor.value) return

  const { state } = editor.value
  const { selection } = state
  const { $from } = selection

  // Get current node
  const node = $from.parent

  if (node.type.name === 'paragraph') {
    // Check if already has indent
    const currentClass = node.attrs.class || ''
    const hasIndent = currentClass.includes('indent-paragraph')

    if (hasIndent) {
      // Remove indent class
      const newClass = currentClass.replace('indent-paragraph', '').trim()
      editor.value.chain().focus().updateAttributes('paragraph', {
        class: newClass || null
      }).run()
    } else {
      // Add indent class
      const newClass = currentClass ? `${currentClass} indent-paragraph` : 'indent-paragraph'
      editor.value.chain().focus().updateAttributes('paragraph', {
        class: newClass
      }).run()
    }
  }
}

// Watch for external changes
watch(() => props.modelValue, (value) => {
  if (editor.value && editor.value.getHTML() !== value) {
    editor.value.commands.setContent(value || '', false)
  }
})

// Cleanup on unmount
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.rich-text-editor :deep(.ProseMirror) {
  min-height: 300px;
  outline: none;
}

.rich-text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.rich-text-editor :deep(.ProseMirror:focus) {
  outline: none;
}

/* Prose styling */
.rich-text-editor :deep(.prose) {
  color: inherit;
  max-width: none;
}

.rich-text-editor :deep(.prose h1) {
  font-size: 2em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose p) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose p.indent-paragraph) {
  text-indent: 2em;
}

.rich-text-editor :deep(.prose ul),
.rich-text-editor :deep(.prose ol) {
  padding-left: 1.5em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose li) {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

.rich-text-editor :deep(.prose blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 1em;
  font-style: italic;
  color: #6b7280;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose code) {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.rich-text-editor :deep(.prose pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.rich-text-editor :deep(.prose hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin-top: 1em;
  margin-bottom: 1em;
}

.rich-text-editor :deep(.prose a) {
  color: oklch(var(--p));
  text-decoration: underline;
}
</style>
