"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Voucher } from "@/types/api"

// Helper to format date for <input type="datetime-local" />
const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return ""
  const d = new Date(date)
  const tzOffset = d.getTimezoneOffset() * 60000
  const localDate = new Date(d.getTime() - tzOffset)
  return localDate.toISOString().slice(0, 16)
}

const formSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã phải có ít nhất 3 ký tự.")
      .transform((val) => val.toUpperCase()),
    description: z.string().optional(),
    discount_type: z.enum(["percentage", "fixed_amount"]),
    discount_value: z.number().positive("Giá trị giảm phải là số dương."),
    hunt_start_time: z
      .date()
      .refine((val) => val != null, "Vui lòng chọn thời gian bắt đầu.")
      .min(new Date(), "Thời gian bắt đầu phải sau thời điểm hiện tại"),
    hunt_end_time: z.date().refine((val) => val != null, "Vui lòng chọn thời gian kết thúc."),
    valid_duration_days: z
      .number()
      .int("Thời hạn phải là số nguyên")
      .min(1, "Thời hạn phải ít nhất 1 ngày."),
    applicable_product_ids: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === "") return true
          const ids = val.split(",").map((id) => parseInt(id.trim(), 10))
          return !ids.some(isNaN)
        },
        {
          message: "ID sản phẩm phải là các con số phân cách bởi dấu phẩy.",
        }
      ),
  })
  .superRefine((data, ctx) => {
    // Validate percentage value
    if (
      data.discount_type === "percentage" &&
      (data.discount_value < 1 || data.discount_value > 100)
    ) {
      ctx.addIssue({
        path: ["discount_value"],
        message: "Tỷ lệ % phải từ 1 đến 100.",
        code: z.ZodIssueCode.custom,
      })
    }
    // Validate date range
    if (data.hunt_start_time >= data.hunt_end_time) {
      ctx.addIssue({
        path: ["hunt_end_time"],
        message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
        code: z.ZodIssueCode.custom,
      })
    }
  })

export type VoucherFormValues = z.infer<typeof formSchema>

interface VoucherFormProps {
  initialData?: Voucher | null
  onSave: (data: VoucherFormValues) => void
  onCancel: () => void
  isSaving: boolean
}

export default function VoucherForm({ initialData, onSave, onCancel, isSaving }: VoucherFormProps) {
  const form = useForm<VoucherFormValues>({
    // Bây giờ kiểu dữ liệu đã nhất quán
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code || "",
      description: initialData?.description || "",
      discount_type: initialData?.discount_type || "fixed_amount",
      discount_value: initialData?.discount_value || 0,
      hunt_start_time: initialData ? new Date(initialData.hunt_start_time) : undefined,
      hunt_end_time: initialData ? new Date(initialData.hunt_end_time) : undefined,
      valid_duration_days: initialData?.valid_duration_days || 7,
      applicable_product_ids: initialData?.applicable_product_ids?.join(", ") || "",
    },
  })

  const onSubmit: SubmitHandler<VoucherFormValues> = (data) => {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-h-[70vh] space-y-4 overflow-y-auto p-1"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã Voucher</FormLabel>
              <FormControl>
                <Input placeholder="SALE50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Giảm 50% cho tất cả Pizza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giảm giá</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giảm giá" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed_amount">Số tiền cố định (VND)</SelectItem>
                    <SelectItem value="percentage">Theo phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá trị giảm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000 hoặc 50"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hunt_start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bắt đầu săn</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? formatDateForInput(field.value) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hunt_end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kết thúc săn</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? formatDateForInput(field.value) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="valid_duration_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời hạn sử dụng (ngày)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="7" {...field} />
              </FormControl>
              <FormDescription>
                Voucher sẽ hết hạn sau số ngày này, kể từ lúc khách hàng nhận.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="applicable_product_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Áp dụng cho ID sản phẩm (tùy chọn)</FormLabel>
              <FormControl>
                <Textarea placeholder="1, 5, 12" {...field} />
              </FormControl>
              <FormDescription>
                Nhập ID các sản phẩm, cách nhau bởi dấu phẩy. Bỏ trống để áp dụng cho tất cả.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu Voucher"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
