export default function CommentCell({ comment }) {
  if (comment.type === "text")
    return (
      <span style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
        {comment.value}
      </span>
    );
  return (
    <ol
      style={{
        margin: 0,
        paddingLeft: 18,
        color: "#475569",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      {comment.value.map((pt, i) => (
        <li key={i} style={{ marginBottom: 3 }}>
          {pt}
        </li>
      ))}
    </ol>
  );
}
