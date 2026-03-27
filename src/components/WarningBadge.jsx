function WarningBadge({ message }) {
  if (!message) return null;
  return <span className="warning-badge" title={message}>⚠️</span>;
}

export default WarningBadge;
