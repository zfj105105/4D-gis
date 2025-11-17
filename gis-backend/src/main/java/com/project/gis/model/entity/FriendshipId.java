package com.project.gis.model.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class FriendshipId implements Serializable
{
    private Long userId;
    private Long friendId;
}
