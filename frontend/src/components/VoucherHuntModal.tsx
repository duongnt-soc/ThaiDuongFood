"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PartyPopper } from "lucide-react"

import { getClaimableVouchers, claimVoucher } from "@/api/vouchers"
import { Voucher } from "@/types/api"
import { useBoundStore } from "@/zustand/total"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export const VoucherHuntModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [claimableVouchers, setClaimableVouchers] = useState<Voucher[]>([])
  const { accountInfo } = useBoundStore()

  useEffect(() => {
    if (accountInfo.id) {
      const checkVouchers = async () => {
        try {
          const data = await getClaimableVouchers()
          if (data && data.length > 0) {
            setClaimableVouchers(data)
            setIsOpen(true)
          }
        } catch (error) {
          console.error(error)
        }
      }
      checkVouchers()
    }
  }, [accountInfo.id])

  const handleClaim = async (voucherId: number) => {
    try {
      await claimVoucher(voucherId)
      toast.success("Đã lưu voucher thành công!")
      setClaimableVouchers((vouchers) => vouchers.filter((v) => v.id !== voucherId))
    } catch (error) {
      toast.error("Lưu voucher thất bại.")
      console.error(error)
    }
  }

  if (!isOpen || claimableVouchers.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="h-80 bg-[url('/assets/sale.png')] bg-cover bg-center bg-no-repeat p-6 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <PartyPopper className="text-yellow-500" />
            Săn Sale! Voucher có sẵn cho bạn
          </DialogTitle>
        </DialogHeader>
        <div className="h-full">
          {claimableVouchers.map((voucher) => (
            <div key={voucher.id} className="rounded-lg p-3">
              <div className="mb-8">
                <p className="mb-2 text-3xl font-bold text-yellow-300">
                  Mã voucher: <br /> #{voucher.code}
                </p>
                <div className="max-w-[200px] text-sm text-white">{voucher.description}</div>
              </div>
              <Button
                className="bg-yellow-500 px-5 py-3 hover:bg-yellow-400"
                onClick={() => handleClaim(voucher.id)}
              >
                Lưu ngay
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
