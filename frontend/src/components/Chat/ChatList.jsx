const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id} onClick={() => onSelectChat(chat)}>
          <h3>{chat.isGroupChat ? chat.name : chat.otherUserName}</h3>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
