import React, { useContext, useEffect, useState } from "react";
import socket from "../Services/socket";
import AuthContext from "../Context/AuthContext";
import {
  getAvailableQueues,
  joinQueue,
  getMyQueueEntry,
} from "../Services/queue";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [token, setToken] = useState(null);
  const [joinedQueueId, setJoinedQueueId] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [status, setStatus] = useState(null);

  const { logout } = useContext(AuthContext);

  /*
   * Fetch available queues
   */
  useEffect(() => {
    const fetchAvailableQueues = async () => {
      try {
        const response = await getAvailableQueues();
        setQueues(response.data.queues);
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    fetchAvailableQueues();
  }, []);

  /*
   * Restore user's existing queue entry
   */
  useEffect(() => {
    if (queues.length === 0) return;

    const restoreMyEntry = async () => {
      try {
        const requests = queues.map((queue) => {
          return getMyQueueEntry(queue._id);
        });

        const responses = await Promise.allSettled(requests);

        const myEntryResponse = responses.find(
          (response) =>
            response.status === "fulfilled" &&
            response.value.data.myEntry
        );

        if (myEntryResponse) {
          setToken(myEntryResponse.value.data.myEntry.tokenNumber);
          setStatus(myEntryResponse.value.data.myEntry.status);
          setJoinedQueueId(myEntryResponse.value.data.myEntry.queue);
          setPeopleAhead(myEntryResponse.value.data.peopleAhead);
        } else {
          setToken(null);
          setJoinedQueueId(null);
          setPeopleAhead(0);
          setStatus(null);
        }
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    restoreMyEntry();
  }, [queues]);

  /*
   * Socket.IO
   */
  useEffect(() => {

    socket.connect()

    if (joinedQueueId) {
      socket.emit("join-queue-room", joinedQueueId);
    }

    const handleQueueUpdated = async (data) => {
      console.log("Queue-updated:", data);

      if (data.queueId !== joinedQueueId) {
        return;
      }

      try {
        const response = await getAvailableQueues();
        setQueues(response.data.queues);

        try {
          const myEntry = await getMyQueueEntry(data.queueId);

          setToken(myEntry.data.myEntry.tokenNumber);
          setStatus(myEntry.data.myEntry.status);
          setPeopleAhead(myEntry.data.peopleAhead);
        } catch (error) {
          if (error.response?.status === 404) {
            setStatus("COMPLETED");
            setPeopleAhead(0);
            setJoinedQueueId(null);
            setToken(null);
          } else {
            console.log(
              "Unable to update my queue entry:",
              error.response?.data
            );
          }
        }
      } catch (error) {
        console.log("Unable to update available queues:", error.response?.data);
      }
    };

    const handleQueueStatusUpdated = async () => {
      try {
        const response = await getAvailableQueues();
        setQueues(response.data.queues);
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    socket.on("queue-updated", handleQueueUpdated);
    socket.on("queue-status-updated", handleQueueStatusUpdated);

    return () => {
      socket.off("queue-updated", handleQueueUpdated);
      socket.off("queue-status-updated", handleQueueStatusUpdated);
    };
  }, [joinedQueueId]);

  /*
   * Join queue
   */
  const handleQueueJoin = async (queueId) => {
    try {
      const response = await joinQueue(queueId);

      setToken(response.data.queueEntry.tokenNumber);
      setJoinedQueueId(queueId);
      setStatus("WAITING");

      toast.success(response.data.message);

      const myEntry = await getMyQueueEntry(queueId);

      setStatus(myEntry.data.myEntry.status);
      setPeopleAhead(myEntry.data.peopleAhead);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to join queue"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <header className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
                <span className="text-lg font-black text-slate-950">
                  Q
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Queue<span className="text-cyan-400">Less</span>
                </h1>

                <p className="text-sm text-slate-400">
                  Skip the wait. Track your turn.
                </p>
              </div>

            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10"
          >
            Logout
          </button>
        </header>

        {/* Main Section */}

        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-indigo-500/15 via-slate-900/80 to-cyan-400/10 p-7 shadow-2xl shadow-black/20">

          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Welcome back
            </p>

            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Find your queue and{" "}
              <span className="text-cyan-400">
                skip the waiting room.
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Join a service queue digitally, keep your token with you,
              and know how many people are ahead of you.
            </p>

            {/* Stats */}

            <div className="mt-7 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">
                  Active Queues
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {queues.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">
                  Your Token
                </p>

                <p className="mt-1 text-2xl font-bold text-cyan-400">
                  {token ?? "--"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">
                  People Ahead
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-300">
                  {joinedQueueId ? peopleAhead : "--"}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section Heading */}

        <div className="mb-5">

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Services
          </p>

          <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                Available Queues
              </h2>

              <p className="text-sm text-slate-400">
                Choose a service and get your token instantly.
              </p>
            </div>

          </div>
        </div>

        {/* Queue Cards */}

        {queues.length === 0 ? (

          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <span className="text-2xl">
                ⌛
              </span>
            </div>

            <h3 className="text-lg font-semibold">
              No active queues
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              There are currently no queues available.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {queues.map((queue) => {

              const isJoined =
                queue._id === joinedQueueId &&
                status !== "COMPLETED";

              const isCompleted =
                queue._id === joinedQueueId &&
                status === "COMPLETED";

              return (
                <div
                  key={queue._id}
                  className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition duration-300 ${
                    isJoined
                      ? "border-cyan-400/40 bg-cyan-400/[0.07] shadow-xl shadow-cyan-500/10"
                      : "border-white/10 bg-white/4 hover:-translate-y-1 hover:border-white/20 hover:bg-white/6"
                  }`}
                >

                  {/* Accent glow */}

                  <div
                    className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${
                      isJoined
                        ? "bg-cyan-400/20"
                        : "bg-indigo-500/10"
                    }`}
                  />

                  <div className="relative">

                    {/* Card top */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-bold">
                          {queue.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />

                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                            Queue Open
                          </span>

                        </div>

                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">

                        <p className="text-[10px] uppercase tracking-wider text-slate-500">
                          Serving
                        </p>

                        <p className="text-lg font-bold">
                          #{queue.currentToken}
                        </p>

                      </div>
                    </div>

                    {/* Queue stats */}

                    <div className="mt-7 grid grid-cols-2 gap-3">

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                        <p className="text-xs text-slate-500">
                          Current Token
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          #{queue.currentToken}
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                        <p className="text-xs text-slate-500">
                          Last Token
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          #{queue.lastToken}
                        </p>

                      </div>

                    </div>

                    {/* Joined state */}

                    {isJoined && (
                      <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-xs uppercase tracking-wider text-cyan-400">
                              Your Token
                            </p>

                            <p className="mt-1 text-3xl font-black text-white">
                              #{token}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-xs uppercase tracking-wider text-slate-500">
                              People Ahead
                            </p>

                            <p className="mt-1 text-2xl font-bold text-indigo-300">
                              {peopleAhead}
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">

                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-bold ${
                              status === "SERVING"
                                ? "text-cyan-400"
                                : status === "WAITING"
                                ? "text-amber-400"
                                : "text-slate-400"
                            }`}
                          >
                            {status ?? "--"}
                          </p>

                        </div>

                      </div>
                    )}

                    {/* Completed state */}

                    {isCompleted && (
                      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">

                        <p className="text-xs uppercase tracking-wider text-emerald-400">
                          Queue Status
                        </p>

                        <p className="mt-1 text-sm font-bold text-emerald-300">
                          COMPLETED
                        </p>

                      </div>
                    )}

                    {/* Action */}

                    <button
                      onClick={() => handleQueueJoin(queue._id)}
                      disabled={isJoined}
                      className={`mt-6 w-full rounded-2xl px-4 py-3 font-semibold transition ${
                        isJoined
                          ? "cursor-not-allowed border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                          : "bg-linear-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-lg shadow-cyan-500/10 hover:scale-[1.01] hover:shadow-cyan-500/20"
                      }`}
                    >
                      {isJoined ? "✓ Joined" : "Join Queue"}
                    </button>

                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* Footer */}

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          QueueLess • Smart queue management
        </footer>

      </div>
    </div>
  );
};

export default UserDashboard;