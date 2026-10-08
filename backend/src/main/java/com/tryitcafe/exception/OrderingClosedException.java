package com.tryitcafe.exception;

public class OrderingClosedException extends RuntimeException {
    private final String code = "ONLINE_ORDERING_CLOSED";

    public OrderingClosedException(String message) {
        super(message);
    }

    public String getCode() {
        return code;
    }
}
