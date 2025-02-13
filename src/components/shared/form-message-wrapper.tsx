type Props = {
  children?: React.ReactNode;
};
export default function FormMessageWrapper({ children }: Props) {
  return <div className="min-h-[1.2rem]">{children}</div>;
}
