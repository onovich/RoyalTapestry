export function StoryModal({ open, text, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal-panel story-panel" onClick={(event) => event.stopPropagation()} aria-label={text.story}>
        <header className="modal-header">
          <h2>{text.storyTitle}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label={text.closeStory}>
            ✕
          </button>
        </header>
        <p className="story-text">{text.storyText}</p>
      </section>
    </div>
  );
}
