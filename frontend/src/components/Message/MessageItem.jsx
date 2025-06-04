const MessageItem = ({ message }) => {
  return (
    <div>
      <p>
        <strong>{message.sender.name}</strong>: {message.content}
      </p>
    </div>
  );
};

export default MessageItem;