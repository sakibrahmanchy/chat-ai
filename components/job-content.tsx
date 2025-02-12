'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface JobContentProps {
  content: string;
}

export function JobContent({ content }: JobContentProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false, // Make it read-only
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none',
      },
    },
  });

  // Update content when it changes
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
} 