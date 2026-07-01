let io = null;

const setIO = (ioInstance) => { io = ioInstance; };

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { setIO, getIO };
