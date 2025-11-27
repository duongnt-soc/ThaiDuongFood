"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Hamburger,
  Boxes,
  Loader2,
  BarChart,
  Crown,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getDashboardStats } from "@/api/user"
import { DashboardStats } from "@/types/api"
import { formatCurrencyVND } from "@/lib/utils"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Không thể lấy số liệu thống kê bảng điều khiển!", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return <div className="p-10 text-center text-red-500">Không thể lấy số liệu thống kê bảng điều khiển.</div>
  }

  const overviewCards = [
    {
      title: "Số danh mục",
      value: stats.totalCategories,
      icon: <Boxes className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Số sản phẩm",
      value: stats.totalProducts,
      icon: <Hamburger className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Tổng đơn hàng",
      value: `${stats.totalOrders}`,
      icon: <ShoppingCart className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Tổng số khách",
      value: `${stats.totalCustomers}`,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Doanh thu",
      value: `${formatCurrencyVND(stats.totalRevenue)}`,
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <div className="flex-1 space-y-4 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {overviewCards.map((card) => (
          <Card key={card.title} className="shadow-none">
            <CardHeader className="flex flex-row justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Doanh thu cửa hàng (Trong 7 ngày)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart
                data={stats.dailyRevenue}
                margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#AD343E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#AD343E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatCurrencyVND(value)}`}
                />
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                    boxShadow: "0 0 5px #eee",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#AD343E"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Khách VIP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topCustomers.map((customer) => (
              <div key={customer.name} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{customer.name}</p>
                </div>
                <div className="ml-auto font-medium">{formatCurrencyVND(customer.totalSpent)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Sản Phẩm Bán Chạy
          </CardTitle>
          <CardDescription>Danh sách sản phẩm được mua nhiều nhất.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="grid flex-grow gap-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                </div>
                <div className="ml-auto font-medium">{product.totalSold} đã bán</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
