import { useLocation } from "react-router-dom";

export default function ResumeViewer() {
  const query = new URLSearchParams(useLocation().search);
  const url = query.get("url");

  return (
    <div style={{ height: "100vh" }}>
      <iframe
        src={url}
        title="Resume"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  );
}
