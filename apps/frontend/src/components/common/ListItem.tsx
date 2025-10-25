interface ListItemProps {
  children: React.ReactNode;
}

export function ListItem({ children }: ListItemProps) {
  return (
    <li className="list-disc text-right text-base leading-relaxed text-[#093059] sm:text-lg lg:text-xl font-medium" dir="rtl">
      {children}
    </li>
  );
}
