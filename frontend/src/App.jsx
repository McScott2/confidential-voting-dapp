import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Users, Lock, Plus, Vote } from 'lucide-react';

const ConfidentialVotingDApp = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
    duration: 24
  });

  const connectWallet = () => {
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    setWalletAddress(mockAddress);
    setWalletConnected(true);
  };

  useEffect(() => {
    setPolls([
      {
        id: 0,
        title: 'Community Treasury Allocation',
        description: 'Vote on how to allocate the community treasury funds for Q4 2025',
        options: ['Development', 'Marketing', 'Community Events', 'Reserve Fund'],
        votes: [0, 0, 0, 0],
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 86400000 * 6,
        creator: '0x1234...5678',
        hasVoted: false,
        finalized: false,
        isActive: true
      },
      {
        id: 1,
        title: 'Protocol Upgrade Proposal',
        description: 'Should we implement the new privacy features in the next update?',
        options: ['Yes, implement now', 'Yes, but after audit', 'No, needs more research'],
        votes: [0, 0, 0],
        startTime: Date.now() - 172800000,
        endTime: Date.now() + 86400000 * 3,
        creator: '0xabcd...efgh',
        hasVoted: false,
        finalized: false,
        isActive: true
      }
    ]);
  }, []);

  const handleCreatePoll = () => {
    if (!newPoll.title || !newPoll.description || newPoll.options.some(opt => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    const poll = {
      id: polls.length,
      title: newPoll.title,
      description: newPoll.description,
      options: newPoll.options.filter(opt => opt),
      votes: new Array(newPoll.options.filter(opt => opt).length).fill(0),
      startTime: Date.now(),
      endTime: Date.now() + (newPoll.duration * 3600000),
      creator: walletAddress,
      hasVoted: false,
      finalized: false,
      isActive: true
    };

    setPolls([...polls, poll]);
    setNewPoll({ title: '', description: '', options: ['', ''], duration: 24 });
    setActiveTab('browse');
    alert('Poll created successfully! (Demo Mode)');
  };

  const handleVote = (pollId, optionIndex) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        return { ...poll, hasVoted: true };
      }
      return poll;
    });
    setPolls(updatedPolls);
    alert(`Vote cast for option ${optionIndex + 1}! Your vote is encrypted on-chain. (Demo Mode)`);
  };

  const addOption = () => {
    if (newPoll.options.length < 10) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: updatedOptions });
    }
  };

  const formatTimeLeft = (endTime) => {
    const diff = endTime - Date.now();
    if (diff < 0) return 'Ended';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800">
      <div className="bg-black bg-opacity-30 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SecretVote</h1>
                <p className="text-purple-300 text-sm">Confidential Voting with FHEVM</p>
              </div>
            </div>
            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-mono text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'browse'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            Browse Polls
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
            disabled={!walletConnected}
          >
            <Plus className="w-5 h-5" />
            Create Poll
          </button>
        </div>

        {!walletConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-200">Connect your wallet to create polls and vote</p>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="space-y-6">
            {polls.length === 0 ? (
              <div className="text-center py-16">
                <Vote className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-purple-200 text-lg">No polls available yet</p>
                <p className="text-purple-400 text-sm mt-2">Create the first poll to get started!</p>
              </div>
            ) : (
              polls.map(poll => (
                <div key={poll.id} className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{poll.title}</h3>
                      <p className="text-purple-200 mb-4">{poll.description}</p>
                      <div className="flex gap-4 text-sm text-purple-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatTimeLeft(poll.endTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Creator: {poll.creator.slice(0, 6)}...{poll.creator.slice(-4)}
                        </div>
                      </div>
                    </div>
                    {poll.isActive && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mt-6">
                    {poll.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <button
                          onClick={() => handleVote(poll.id, idx)}
                          disabled={!walletConnected || poll.hasVoted || !poll.isActive}
                          className={`flex-1 p-4 rounded-lg text-left transition-all duration-200 ${
                            poll.hasVoted
                              ? 'bg-purple-600/30 border-2 border-purple-500 cursor-not-allowed'
                              : walletConnected && poll.isActive
                              ? 'bg-white/10 border-2 border-purple-500/30 hover:border-purple-500 hover:bg-white/20 cursor-pointer'
                              : 'bg-white/5 border-2 border-white/10 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">{option}</span>
                            {poll.hasVoted && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {poll.hasVoted && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-semibold">Your vote has been encrypted and recorded on-chain</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Poll</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 font-semibold mb-2">Poll Title</label>
                <input
                  type="text"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  placeholder="e.g., Choose next feature to implement"
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-2">Description</label>
                <textarea
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                  placeholder="Provide details about this poll..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-2">Options</label>
                {newPoll.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        onClick={() => removeOption(idx)}
                        className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {newPoll.options.length < 10 && (
                  <button
                    onClick={addOption}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-dashed border-purple-500/30 rounded-lg text-purple-300 hover:bg-white/20 hover:border-purple-500 transition-all"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-purple-200 font-semibold mb-2">Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  value={newPoll.duration}
                  onChange={(e) => setNewPoll({ ...newPoll, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleCreatePoll}
                disabled={!walletConnected}
                className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Create Poll
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-purple-500/20">
        <div className="text-center text-purple-300 text-sm">
          <p className="mb-2">🔒 All votes are encrypted using FHEVM technology</p>
          <p>Built for Zama Developer Program • Demo Mode</p>
        </div>
      </div>
    </div>
  );
};

export default ConfidentialVotingDApp;
