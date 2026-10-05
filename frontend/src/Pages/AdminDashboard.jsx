import React, { useEffect, useState } from "react";
import socket from "../Services/socket";
import {
  callNext,
  createQueue,
  getMyQueues,
  getQueueEntries,
  updateQueueStatus,
} from "../Services/queue";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [queueEntries, setQueueEntries] = useState([]);
  const [queueName, setQueueName] = useState("")

 
  
  

  useEffect(() => {
    const fetchMyQueues = async () => {
      try {
        const response = await getMyQueues();
        setQueues(response.data.queues);
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchMyQueues();
  }, []);



  useEffect(() => {
    if (!selectedQueueId) return;

    const fetchMyQueueEntries = async () => {
      try {
        const response = await getQueueEntries(selectedQueueId);
        setQueueEntries(response.data.entries);
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchMyQueueEntries();
  }, [selectedQueueId]);



 useEffect(() => {

  socket.connect()

  if (!selectedQueueId) return;

  const joinQueueRoom = () => {
    socket.emit("join-queue-room", selectedQueueId);
  };

  const handleQueueUpdated = async (data) => {
    console.log("Admin received queue update:", data);

    if (data.queueId !== selectedQueueId) return;

    try {
      const response = await getQueueEntries(selectedQueueId);

      setQueueEntries(response.data.entries);

    } catch (error) {
      console.log("Admin socket update error:", error.response?.data);
    }
  };

  if (socket.connected) {
    joinQueueRoom();
  }

  socket.on("connect", joinQueueRoom);
  socket.on("queue-updated", handleQueueUpdated);

  return () => {
    socket.off("connect", joinQueueRoom);
    socket.off("queue-updated", handleQueueUpdated);
  };
}, [selectedQueueId]);
  


  const handleCallNext = async () => {
    try {
      const response = await callNext(selectedQueueId);
      toast.success(response.data.message);

      const entriesResponse = await getQueueEntries(selectedQueueId);

      setQueueEntries(entriesResponse.data.entries);

      const queuesResponse = await getMyQueues();
      setQueues(queuesResponse.data.queues);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to call next customer",
      );
    }
  };

  const handleQueueStatus = async () => {
    try {
      const currentQueue = queues.find(
        (queue) => queue._id === selectedQueueId,
      );

      if (!currentQueue) {
        toast.error("Selected queue not found");
        return;
      }

      const response = await updateQueueStatus(
        selectedQueueId,
        !currentQueue.isActive,
      );

      toast.success(response.data.message);

      const queuesResponse = await getMyQueues();
      setQueues(queuesResponse.data.queues);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  const handleCreateQueue = async () => {
    
    try {
      
      if(!queueName.trim()){
        toast.error("Queue name is required")
        return
      }

      const response = await createQueue(queueName);

      toast.success(response.data.message)

      setQueueName("")

      const queueResponses = await getMyQueues();
      setQueues(queueResponses.data.queues)

    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create a queue')
    }

  };

  const selectedQueue = queues.find((queue) => queue._id === selectedQueueId);

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              QueueLess Admin
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your queues and manage customers in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedQueue && (
              <div className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 sm:block">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Selected Queue
                </p>

                <p className="text-sm font-semibold text-slate-200">
                  {selectedQueue.name}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Grid */}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* Queues */}

          <section>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Management
              </p>

              <h2 className="mt-1 text-2xl font-bold">Your Queues</h2>

              <p className="mt-1 text-sm text-slate-400">
                Select a queue to manage its customers.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-white/10 bg-white/4 p-5">
              <h3 className="text-lg font-bold">
                Create Queue
              </h3>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                 type="text"
                 value={queueName}
                 onChange={(e)=> setQueueName(e.target.value)}
                 placeholder="Enter the queue name"
                 className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                 />

                 <button
                 onClick={handleCreateQueue}
                  className="rounded-xl bg-linear-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-bold text-shadow-slate-950">
                  Create Queue
                 </button>
              </div>
            </div>

            {queues.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/4 p-8 text-center backdrop-blur-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <span className="text-2xl">⌛</span>
                </div>

                <h3 className="font-semibold">No queues available</h3>

                <p className="mt-2 text-sm text-slate-400">
                  You don't have any queues to manage yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {queues.map((queue) => {
                  const isSelected = queue._id === selectedQueueId;

                  return (
                    <div
                      key={queue._id}
                      onClick={() => setSelectedQueueId(queue._id)}
                      className={`group cursor-pointer rounded-2xl border p-5 transition duration-200 ${
                        isSelected
                          ? "border-cyan-400/40 bg-cyan-400/[0.07] shadow-lg shadow-cyan-500/10"
                          : "border-white/10 bg-white/4 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/6"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">{queue.name}</h3>

                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                queue.isActive
                                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                  : "bg-slate-600"
                              }`}
                            />

                            <span
                              className={`text-xs font-semibold uppercase tracking-wider ${
                                queue.isActive
                                  ? "text-emerald-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {queue.isActive ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">
                            Current
                          </p>

                          <p className="text-lg font-bold">
                            #{queue.currentToken}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Last token</span>

                        <span className="font-semibold text-slate-200">
                          #{queue.lastToken}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-4 border-t border-white/10 pt-3">
                          <p className="text-xs font-medium text-cyan-400">
                            Selected for management
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Selected Queue */}

          <section>
            {!selectedQueueId ? (
              <div className="flex min-h-105 items-center justify-center rounded-3xl border border-white/10 bg-white/3 p-10 text-center backdrop-blur-xl">
                <div>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <span className="text-2xl">↖</span>
                  </div>

                  <h2 className="text-xl font-bold">Select a queue</h2>

                  <p className="mt-2 max-w-sm text-sm text-slate-400">
                    Choose one of your queues from the left to view customers
                    and manage the queue.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

                {/* Selected Queue Header */}
                
                <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                      Active Queue
                    </p>

                    <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                      {selectedQueue?.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={`flex items-center gap-2 text-sm ${
                          selectedQueue?.isActive
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            selectedQueue?.isActive
                              ? "bg-emerald-400"
                              : "bg-slate-600"
                          }`}
                        />

                        {selectedQueue?.isActive
                          ? "Queue is open"
                          : "Queue is closed"}
                      </span>

                      <span className="text-slate-700">•</span>

                      <span className="text-sm text-slate-400">
                        Current token #{selectedQueue?.currentToken}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleCallNext}
                      className="rounded-xl bg-linear-to-r from-cyan-400 to-indigo-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:scale-[1.02] hover:shadow-cyan-500/20 active:scale-[0.99]"
                    >
                      Next Customer
                    </button>

                    <button
                      onClick={handleQueueStatus}
                      className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
                        selectedQueue?.isActive
                          ? "border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15"
                          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                      }`}
                    >
                      {selectedQueue?.isActive ? "Close Queue" : "Open Queue"}
                    </button>
                  </div>
                </div>

                {/* Queue Stats */}

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Current Token
                    </p>

                    <p className="mt-2 text-3xl font-black text-cyan-400">
                      #{selectedQueue?.currentToken}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Last Token
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      #{selectedQueue?.lastToken}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Customers
                    </p>

                    <p className="mt-2 text-3xl font-black text-indigo-300">
                      {queueEntries.length}
                    </p>
                  </div>
                </div>

                {/* Queue Entries */}

                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Queue Entries</h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Customers currently associated with this queue.
                      </p>
                    </div>
                  </div>

                  {queueEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-10 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                        <span className="text-xl">👥</span>
                      </div>

                      <h4 className="font-semibold">No customers yet</h4>

                      <p className="mt-2 text-sm text-slate-500">
                        No one has joined this queue.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {queueEntries.map((entry) => (
                        <div
                          key={entry._id}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/15 hover:bg-black/30 sm:p-5"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* User */}
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400/20 to-indigo-500/20 text-sm font-bold text-cyan-300">
                                {entry.user.username?.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <p className="font-semibold text-white">
                                  {entry.user.username}
                                </p>

                                <p className="text-xs text-slate-500">
                                  Token #{entry.tokenNumber}
                                </p>
                              </div>
                            </div>

                            {/* Token */}

                            <div className="sm:text-center">
                              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                Token
                              </p>

                              <p className="mt-1 text-xl font-black">
                                #{entry.tokenNumber}
                              </p>
                            </div>

                            {/* Status */}

                            <div className="sm:text-right">
                              <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                                Status
                              </p>

                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                                  entry.status === "SERVING"
                                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                    : entry.status === "WAITING"
                                      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                      : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                                }`}
                              >
                                {entry.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-600">
          QueueLess • Queue management system
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
