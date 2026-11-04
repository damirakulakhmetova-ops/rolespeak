export const FOOTER_TEXT =
  "For language practice only. Not medical advice. Not affiliated with OET. Predicted scores are practice estimates, not official OET results.";

export default function Footer() {
  return (
    <footer className="mt-auto bg-night px-4 py-6 text-center text-xs leading-relaxed text-[#b2c5ca]">
      <div className="mx-auto max-w-[1120px]">
        <span className="font-bold text-white">RoleSpeak</span> · {FOOTER_TEXT}
      </div>
    </footer>
  );
}
