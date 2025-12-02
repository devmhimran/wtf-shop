'use client';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function TextEditor({
  value,
  onChange,
  placeholder,
  readOnly = false,
}: TextEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['clean'],
    ],
  };

  return (
    <div>
      <ReactQuill
        theme='snow'
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
