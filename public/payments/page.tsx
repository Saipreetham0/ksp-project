"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PaymentTransaction } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = useSearchParams();
  const pageFromUrl = searchParams.get("page");


  // Separate the search params logic into its own component
function SearchParamsHandler({ onPageChange }: { onPageChange: (page: number) => void }) {
    const searchParams = useSearchParams();

    useEffect(() => {
      const pageFromUrl = searchParams.get("page");
      if (pageFromUrl) {
        onPageChange(parseInt(pageFromUrl, 10));
      }
    }, [searchParams, onPageChange]);

    return null;
  }

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("payment_transactions")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortOrder === "asc" })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1
        );

      if (searchTerm) {
        query = query.or(
          `order_id.ilike.%${searchTerm}%,payment_id.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setPayments(data as PaymentTransaction[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortColumn, sortOrder, searchTerm]);

  useEffect(() => {
    if (pageFromUrl) {
      setCurrentPage(parseInt(pageFromUrl, 10));
    }
  }, [pageFromUrl]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSort = (column: string) => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setSortColumn(column);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onPageChange={handlePageChange} />
      </Suspense>

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-5">Payment Transactions</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order or payment ID"
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>
          <Select
            value={`${ITEMS_PER_PAGE}`}
            //   onValueChange={(value) => {
            //     // This is where you would handle changing items per page
            //     // For simplicity, we're not implementing this functionality
            //   }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("order_id")}
                    className="text-xs sm:text-sm"
                  >
                    Order ID
                    <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("payment_id")}
                    className="text-xs sm:text-sm"
                  >
                    Payment ID
                    <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("amount")}
                    className="text-xs sm:text-sm"
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="text-xs sm:text-sm"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("created_at")}
                    className="text-xs sm:text-sm"
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="bg-white">
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {payment.order_id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {payment.payment_id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{`${payment.amount} ${payment.currency}`}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {payment.status}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * ITEMS_PER_PAGE >= totalCount}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
