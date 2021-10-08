package fr.inra.urgi.datadiscovery.filter.faidare;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

/**
 * Unit tests for {@link FaidareUserManager}
 * @author JB Nizet
 */
class FaidareUserManagerTest {

    private FaidareUserGroupsClient mockUserGroupsClient;
    private FaidareUserManager userManager;

    @BeforeEach
    void prepare() {
        mockUserGroupsClient = mock(FaidareUserGroupsClient.class);
        userManager = new FaidareUserManager(mockUserGroupsClient);
    }

    @Test
    void shouldGetTheUserAndCacheItAndAddPublicGroupIfNotPresent() {
        when(mockUserGroupsClient.loadUserGroups("john")).thenReturn(Mono.just(Collections.singleton(1)));

        FaidareUser expectedUser = new FaidareUser("john", new HashSet<>(Arrays.asList(0, 1)));

        FaidareUser actual = userManager.getFaidareUser("john");
        assertThat(actual).isEqualTo(expectedUser);

        actual = userManager.getFaidareUser("john");
        assertThat(actual).isEqualTo(expectedUser);

        verify(mockUserGroupsClient, times(1)).loadUserGroups("john");
    }

    @Test
    void shouldGetAnonymousIfExceptionWhenLoadingUserGroups() {
        when(mockUserGroupsClient.loadUserGroups("john")).thenThrow(new RuntimeException());

        FaidareUser expectedUser = FaidareUser.ANONYMOUS;

        FaidareUser actual = userManager.getFaidareUser("john");
        assertThat(actual).isEqualTo(expectedUser);

        actual = userManager.getFaidareUser("john");
        assertThat(actual).isEqualTo(expectedUser);

        verify(mockUserGroupsClient, times(2)).loadUserGroups("john");
    }
}
