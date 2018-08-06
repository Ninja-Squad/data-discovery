package fr.inra.urgi.rare.harvest;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Optional;

import fr.inra.urgi.rare.dao.HarvestResultDao;
import org.hamcrest.CustomTypeSafeMatcher;
import org.hamcrest.Matcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

/**
 * MVC tests for {@link HarvesterController}
 * @author JB Nizet
 */
@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = HarvesterController.class, secure = false)
class HarvesterControllerTest {
    @MockBean
    private AsyncHarvester mockAsyncHarvester;

    @MockBean
    private HarvestResultDao mockHarvestResultDao;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldGet() throws Exception {
        HarvestResult harvestResult = HarvestResult.builder().build();

        when(mockHarvestResultDao.findById(harvestResult.getId())).thenReturn(Optional.of(harvestResult));

        mockMvc.perform(get("/api/harvests/{id}", harvestResult.getId()))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(harvestResult.getId()));
    }

    @Test
    void shouldThrowIfNotFound() throws Exception {
        mockMvc.perform(get("/api/harvests/nonExisting"))
               .andExpect(status().isNotFound());
    }

    @Test
    public void shouldHarvest() throws Exception {
        mockMvc.perform(post("/api/harvests"))
               .andExpect(status().isCreated())
               .andExpect(header().string(HttpHeaders.LOCATION, matches("^(.*)/api/harvests/(.+)$")));
    }

    @Test
    void shouldList() throws Exception {
        HarvestResult harvestResult = HarvestResult.builder().end();

        PageRequest pageRequest = PageRequest.of(0, HarvesterController.PAGE_SIZE);
        when(mockHarvestResultDao.list(pageRequest))
            .thenReturn(new PageImpl<>(Arrays.asList(harvestResult), pageRequest, 1));

        mockMvc.perform(get("/api/harvests"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.number").value(0))
               .andExpect(jsonPath("$.content[0].id").value(harvestResult.getId()))
               .andExpect(jsonPath("$.content[0].startInstant").value(harvestResult.getStartInstant().toString()))
               .andExpect(jsonPath("$.content[0].endInstant").value(harvestResult.getEndInstant().toString()));
    }

    private static Matcher<String> matches(String regexp) {
        return new CustomTypeSafeMatcher<String>("should match regexp " + regexp) {
            @Override
            protected boolean matchesSafely(String item) {
                return item.matches(regexp);
            }
        };
    }
}
