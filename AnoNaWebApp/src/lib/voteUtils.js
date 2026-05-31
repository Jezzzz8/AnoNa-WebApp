// lib/voteUtils.js
export const getDeviceId = () => {
  let id = localStorage.getItem('anona_device_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36);
    localStorage.setItem('anona_device_id', id);
  }
  return id;
};

export const hasVoted = (pollId) => {
  const votes = JSON.parse(localStorage.getItem('anona_votes') || '{}');
  return !!votes[pollId];
};

export const saveVoteRecord = (pollId, deviceId) => {
  const votes = JSON.parse(localStorage.getItem('anona_votes') || '{}');
  votes[pollId] = deviceId;
  localStorage.setItem('anona_votes', JSON.stringify(votes));
};