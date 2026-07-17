// Avatar používateľa — fotka ak má, inak farebné koliesko s iniciálou.
export default function UserAvatar({
  name,
  avatar,
  size = 32,
}: {
  name: string;
  avatar?: string | null;
  size?: number;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className="user-avatar"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      title={name}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} />
      ) : (
        initial
      )}
    </span>
  );
}
