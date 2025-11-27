import Main from "@/app/layouts/main"
import { VoucherHuntModal } from "@/components/VoucherHuntModal"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Main>
      {children}
      <VoucherHuntModal />
    </Main>
  )
}
