import DataTablesBlock from "./DataTablesBlock";

export default function WelcomeContent({ assistantName, intro, summaryTable, closing }) {
  return (
    <>
      Hello! I'm your <strong>{assistantName}</strong>.
      <br />
      <br />
      {intro}
      {summaryTable && (
        <div style={{ marginTop: 16, marginBottom: closing ? 16 : 0 }}>
          <DataTablesBlock tables={[summaryTable]} />
        </div>
      )}
      {closing}
    </>
  );
}
