import { useState, useEffect, useRef } from 'react';
import { useGetFollowers, useGetMessages, useSendMessage, useGetChatRooms, useGetCurrentUser } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { useForm } from "react-hook-form";
import { Models } from 'appwrite';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MessageFormData = {
    content: string;
};

const Chat = () => {
    const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const { register, handleSubmit, reset } = useForm<MessageFormData>();
    const { data: currentUser } = useGetCurrentUser();

    // console.log(currentUser?.$id);
    const { data: chatRooms, isLoading: isLoadingChatRooms } = useGetChatRooms(currentUser?.id);
    console.log(chatRooms);

    const { data: messages, isLoading: isLoadingMessages } = useGetMessages(selectedChatRoom || "");
    const { mutate: sendMessage, isLoading: isSending } = useSendMessage();

    const { data: followersData } = useGetFollowers(currentUser?.$id || "");

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const onSubmit = (data: MessageFormData) => {
        if (!selectedChatRoom || !data.content.trim()) return;

        sendMessage({
            chatRoomId: selectedChatRoom,
            senderId: currentUser?.$id || "",
            content: data.content,
            createdAt: new Date()
        }, {
            onSuccess: () => {
                reset();
            }
        });
    };
    // 
    // console.log(chatRooms?.documents);


    return (
        <div className="flex h-[calc(100vh-80px)]">
            {/* Followers sidebar */}
            <div className="w-1/4 border-r p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Chats</h2>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="shad-button_primary rounded-lg">Start Chat</Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Start a New Chat</DialogTitle>
                            </DialogHeader>
                            <div className="h-[400px] overflow-y-auto rounded-lg">
                                {followersData?.documents.map((user) => (
                                    <div
                                        key={user.$id}
                                        className="py-2 px-3 cursor-pointer hover:bg-light-4 flex items-center rounded-[12px]"
                                    >
                                        <img
                                            src={user.imageUrl}
                                            alt={user.username}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                        <span>{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Chat Room List */}
                {isLoadingChatRooms ? (
                    <Loader />
                ) : (
                    chatRooms?.documents.map((room) => (
                        <div
                            key={room.$id}
                            onClick={() => setSelectedChatRoom(room.$id)}
                            className={`p-2 cursor-pointer hover:bg-light-4 rounded ${selectedChatRoom === room.$id ? 'bg-light-4' : ''
                                }`}
                        >
                            <img
                                src={room.otherParticipant?.imageUrl}
                                alt={room.otherParticipant?.username}
                                className="w-8 h-8 rounded-full inline-block mr-2"
                            />
                            <div className="inline-block">
                                <p className="font-semibold">{room.otherParticipant?.name}</p>
                                {/* <p className="text-sm text-gray-500 truncate">{room?.lastMessage}</p> */}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {selectedChatRoom ? (
                    <>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {isLoadingMessages ? (
                                <Loader />
                            ) : (
                                <div className="w-full max-w-5xl flex flex-col gap-6">
                                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                                        {messages?.documents.map((message: Models.Document) => (
                                            <div
                                                key={message.$id}
                                                className={`flex ${message.senderId === currentUser?.$id ? "justify-end" : "justify-start"
                                                    } mb-4`}
                                            >
                                                <div
                                                    className={`px-4 py-2 rounded-lg ${message.senderId === currentUser?.$id
                                                        ? "bg-primary-500 text-light-1"
                                                        : "bg-light-4"
                                                        }`}
                                                >
                                                    {message.content}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messageEndRef} />
                                    </div>

                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="flex gap-4 items-center"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="shad-input"
                                            {...register("content")}
                                        />
                                        <Button
                                            type="submit"
                                            className="shad-button_primary"
                                            disabled={isSending}
                                        >
                                            {isSending ? <Loader /> : "Send"}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a chat room to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;