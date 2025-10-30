import React, { useState, useEffect } from "react";
import { transactionAPI, bookAPI, memberAPI } from "../services/api";
import { toast } from "react-toastify";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    book_id: "",
    member_id: "",
    days: 14,
  });
  const [returnFormData, setReturnFormData] = useState({ transaction_id: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, booksRes, membersRes] = await Promise.all([
        transactionAPI.getAll({ limit: 50 }),
        bookAPI.getAll({ available: "true" }),
        memberAPI.getAll({ status: "Active" }),
      ]);
      setTransactions(transRes.data.data);
      setBooks(booksRes.data.data);
      setMembers(membersRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.issueBook(issueFormData);
      toast.success("Book issued successfully");
      setShowIssueModal(false);
      fetchData();
      setIssueFormData({ book_id: "", member_id: "", days: 14 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to issue book");
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();
    try {
      const response = await transactionAPI.returnBook(returnFormData);
      const fineAmount = response.data.data?.fine_amount || 0;
      if (fineAmount > 0) {
        toast.success(
          `Book returned successfully! Fine amount: LKR ${fineAmount.toFixed(
            2
          )}`
        );
      } else {
        toast.success("Book returned successfully! No fine.");
      }
      setShowReturnModal(false);
      fetchData();
      setReturnFormData({ transaction_id: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to return book");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Transactions Management
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowIssueModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              📚 Issue Book
            </button>
            <button
              onClick={() => setShowReturnModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              ✅ Return Book
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        ID
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Book
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Member
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Issue Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Due Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Return Date
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fine (LKR)
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((trans) => (
                      <tr key={trans.transaction_id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {trans.transaction_id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {trans.book_title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {trans.member_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(trans.issue_date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(trans.due_date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {trans.return_date
                            ? new Date(trans.return_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {trans.fine_amount > 0 ? (
                            <span className="text-red-600 font-medium">
                              {parseFloat(trans.fine_amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-green-600">0.00</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              trans.status === "Issued"
                                ? "bg-blue-100 text-blue-800"
                                : trans.status === "Returned"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {trans.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {showIssueModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-10">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      onClick={() => setShowIssueModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">Issue Book</h3>
                  <form onSubmit={handleIssueBook} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select Book *
                      </label>
                      <select
                        value={issueFormData.book_id}
                        onChange={(e) =>
                          setIssueFormData({
                            ...issueFormData,
                            book_id: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose a book...</option>
                        {books.map((book) => (
                          <option key={book.book_id} value={book.book_id}>
                            {book.title} ({book.available_copies} available)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select Member *
                      </label>
                      <select
                        value={issueFormData.member_id}
                        onChange={(e) =>
                          setIssueFormData({
                            ...issueFormData,
                            member_id: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose a member...</option>
                        {members.map((member) => (
                          <option
                            key={member.member_id}
                            value={member.member_id}
                          >
                            {member.first_name} {member.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loan Period (days) *
                      </label>
                      <input
                        type="number"
                        value={issueFormData.days}
                        onChange={(e) =>
                          setIssueFormData({
                            ...issueFormData,
                            days: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        min="1"
                        max="90"
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowIssueModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Issue Book
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReturnModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-10">
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      onClick={() => setShowReturnModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">Return Book</h3>
                  <form onSubmit={handleReturnBook} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Transaction ID *
                      </label>
                      <input
                        type="number"
                        value={returnFormData.transaction_id}
                        onChange={(e) =>
                          setReturnFormData({ transaction_id: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter transaction ID"
                        required
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowReturnModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Return Book
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
