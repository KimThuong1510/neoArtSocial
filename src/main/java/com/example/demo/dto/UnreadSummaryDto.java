package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UnreadSummaryDto {
    private long directUnread;
    private long requestUnread;
    private long groupUnread;
    private long totalUnread;
}

