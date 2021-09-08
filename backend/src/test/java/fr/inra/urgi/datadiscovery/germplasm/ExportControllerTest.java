package fr.inra.urgi.datadiscovery.germplasm;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

import fr.inra.urgi.datadiscovery.config.AppProfile;
import fr.inra.urgi.datadiscovery.dao.AggregationAnalyzer;
import fr.inra.urgi.datadiscovery.dao.SearchRefinements;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareAggregation;
import fr.inra.urgi.datadiscovery.dao.faidare.FaidareDocumentDao;
import fr.inra.urgi.datadiscovery.germplasm.api.FaidareApiService;
import fr.inra.urgi.datadiscovery.germplasm.api.GermplasmExportCommand;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import reactor.core.publisher.Flux;

/**
 * MVC tests for {@link ExportController}
 * @author JB Nizet
 */
@WebMvcTest(ExportController.class)
@ActiveProfiles(AppProfile.FAIDARE)
class ExportControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FaidareApiService mockFaidareApiService;

    @MockBean
    private FaidareDocumentDao mockFaidareDocumentDao;

    @MockBean
    private AggregationAnalyzer mockAggregationAnalyzer;

    @BeforeEach
    void prepare() {
        when(mockAggregationAnalyzer.getAggregations()).thenReturn(Arrays.asList(FaidareAggregation.values()));
    }

    @Test
    void shouldThrowIfNoEntryTypeAggregation() throws Exception {
        mockMvc.perform(get("/api/germplasms/export"))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldThrowIfEntryTypeAggregationWithMoreThanGermplasm() throws Exception {
        mockMvc.perform(get("/api/germplasms/export")
                            .param(FaidareAggregation.ENTRY_TYPE.getName(), "foo")
                            .param(FaidareAggregation.ENTRY_TYPE.getName(), "germplasm"))
               .andExpect(status().isBadRequest());
    }

    @Test
    void shouldExportGermplasms() throws Exception {
        HashSet<String> expectedIds = new HashSet<>(Arrays.asList("a", "b"));
        GermplasmExportCommand expectedCommand = new GermplasmExportCommand(expectedIds, Collections.emptyList());
        when(mockFaidareDocumentDao.findAllIds("something",
                                               false,
                                               SearchRefinements.builder()
                                                                .withTerm(FaidareAggregation.COUNTRY_OF_ORIGIN, Collections.singletonList("France"))
                                                                .withTerm(FaidareAggregation.ENTRY_TYPE, Collections.singletonList("germplasm"))
                                                                .build())
        ).thenReturn(expectedIds);

        DataBufferFactory dataBufferFactory = new DefaultDataBufferFactory();
        when(mockFaidareApiService.export(expectedCommand)).thenReturn(
            Flux.fromArray(new DataBuffer[] {
                dataBufferFactory.wrap("A;B;C\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a1;b1;c1\n".getBytes(StandardCharsets.UTF_8)),
                dataBufferFactory.wrap("a2;b2;c2\n".getBytes(StandardCharsets.UTF_8))
            })
        );

        MvcResult mvcResult = mockMvc.perform(get("/api/germplasms/export")
                                                  .param("query", "something")
                                                  .param(FaidareAggregation.COUNTRY_OF_ORIGIN.getName(), "France")
                                                  .param(FaidareAggregation.ENTRY_TYPE.getName(), "germplasm"))
                                     .andExpect(request().asyncStarted())
                                     .andReturn();
        mockMvc.perform(asyncDispatch(mvcResult))
               .andExpect(status().isOk())
               .andExpect(content().contentType("text/csv"))
               .andExpect(content().string("A;B;C\na1;b1;c1\na2;b2;c2\n"));
    }
}
