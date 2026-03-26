import React, { useState } from "react";

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [content, setContent] = useState("");

  /* =========================
     📁 UPLOAD FILE / FOLDER
  ========================= */
  const handleUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);

    const newFiles = uploadedFiles.map((file) => ({
      name: file.name,
      file: file,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  /* =========================
     📄 OPEN FILE
  ========================= */
  const openFile = (fileObj, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      setSelectedIndex(index);
      setContent(e.target.result);
    };

    reader.readAsText(fileObj.file);
  };

  /* =========================
     💾 SAVE FILE (DOWNLOAD)
  ========================= */
  const saveFile = () => {
    if (selectedIndex === null) return;

    const fileName = files[selectedIndex].name;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* =========================
     🗑 DELETE FILE
  ========================= */
  const deleteFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);

    if (selectedIndex === index) {
      setSelectedIndex(null);
      setContent("");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>

      {/* ================= LEFT PANEL ================= */}
      <div
        style={{
          width: "260px",
          background: "#111827",
          color: "white",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>📁 File Manager</h2>

        {/* Upload */}
        <input
          type="file"
          multiple
          webkitdirectory="true"
          directory=""
          onChange={handleUpload}
          style={{ marginBottom: "10px" }}
        />

        {/* File List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                padding: "8px",
                marginBottom: "4px",
                cursor: "pointer",
                borderRadius: "6px",
                background:
                  selectedIndex === index ? "#2563eb" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span onClick={() => openFile(file, index)}>
                {file.name}
              </span>

              <button
                onClick={() => deleteFile(index)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                }}
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#1f2937",
          color: "white",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            padding: "10px",
            background: "#374151",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {selectedIndex !== null
              ? files[selectedIndex].name
              : "No file selected"}
          </span>

          <button
            onClick={saveFile}
            style={{
              background: "#2563eb",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
            }}
          >
            💾 Save
          </button>
        </div>

        {/* Editor */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="File content will appear here..."
          style={{
            flex: 1,
            padding: "10px",
            background: "#020617",
            color: "#22c55e",
            border: "none",
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      </div>
    </div>
  );
}