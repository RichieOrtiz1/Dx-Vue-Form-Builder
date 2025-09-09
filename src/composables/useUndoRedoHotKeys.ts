import { onMounted, onBeforeUnmount } from 'vue';

type Options = {
    // If true, hotkeys work even when you're typing in inputs/textareas/contenteditable
    allowInInputs?: boolean;
    // Attach listener to a specific element (default: window)
    target?: Window | Document | HTMLElement;
};

export function useUndoRedoHotkeys(
    undo: () => void,
    redo: () => void,
    options: Options = {}
) {
    const target: any = options.target ?? window;
    const allowInInputs = !!options.allowInInputs;

    const handler = (e: KeyboardEvent) => {
        // Ignore if focused in editable fields (unless explicitly allowed)
        if (!allowInInputs) {
            const el = e.target as HTMLElement | null;
            const tag = (el?.tagName || '').toLowerCase();
            const isEditable =
                tag === 'input' ||
                tag === 'textarea' ||
                (el && (el as HTMLElement).isContentEditable);
            if (isEditable) return;
        }

        const isMac = navigator.platform.toLowerCase().includes('mac');
        const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

        if (!ctrlOrCmd) return;

        const key = e.key.toLowerCase();
        const shift = e.shiftKey;

        // Undo: Ctrl/Cmd+Z
        if (key === 'z' && !shift) {
            e.preventDefault();
            undo();
            return;
        }

        // Redo: Ctrl/Cmd+Shift+Z
        if (key === 'z' && shift) {
            e.preventDefault();
            redo();
            return;
        }

        // Redo (Windows convention): Ctrl+Y
        if (!isMac && key === 'y') {
            e.preventDefault();
            redo();
            return;
        }
    };

    onMounted(() => target.addEventListener('keydown', handler, { capture: true }));
    onBeforeUnmount(() => target.removeEventListener('keydown', handler, { capture: true }));
}
