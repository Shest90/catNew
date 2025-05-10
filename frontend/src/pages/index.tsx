// pages/index.tsx (или src/pages/index.tsx)
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/auth",
    permanent: false,
  },
});

export default function Index() {
  return null;
}
